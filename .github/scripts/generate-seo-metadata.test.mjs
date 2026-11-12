import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  MAX_OUTPUT_TOKENS,
  CliError,
  applyMetadata,
  assertPricing,
  buildCountRequest,
  buildRequest,
  calculateActualCost,
  countInputTokens,
  createUnifiedDiff,
  estimateCost,
  isEligibleArticle,
  loadEnvironment,
  parseArgs,
  parseArticle,
  requestedFields,
  resolveArticlePaths,
  responseSchema,
  runCli,
} from './generate-seo-metadata.mjs';

const catalog = {
  currency: 'USD',
  serviceTier: 'standard',
  source: 'https://example.com/pricing',
  lastVerified: '2026-11-12',
  models: {
    'gpt-6-astra': {
      perMillionTokens: {
        input: 10,
        cachedInput: 1,
        cacheWrite30m: 12.5,
        cacheWrite12h: 25,
        output: 50,
      },
      longContext: {
        thresholdInputTokens: 272000,
        inputMultiplier: 2,
        cachedInputMultiplier: 2,
        cacheWriteMultiplier: 2,
        outputMultiplier: 1.5,
      },
    },
  },
};

function memoryIo({ isTTY = true } = {}) {
  let stdout = '';
  let stderr = '';
  return {
    stdin: { isTTY },
    stdout: { write: (value) => { stdout += value; } },
    stderr: { write: (value) => { stderr += value; } },
    output: () => stdout,
    error: () => stderr,
  };
}

function createRepository(files) {
  const root = mkdtempSync(path.join(tmpdir(), 'shopware-seo-test-'));
  for (const [relativePath, content] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, relativePath)), { recursive: true });
    writeFileSync(path.join(root, relativePath), content);
  }
  return root;
}

function validDescription(character = 'x') {
  return `Understand Shopware documentation metadata and discover accurate implementation details for developers using this focused technical guide${character}`.padEnd(159, character).slice(0, 159) + '.';
}

function completedResponse(metadata, usage = {}) {
  return {
    status: 'completed',
    output: [],
    output_text: JSON.stringify(metadata),
    usage: {
      input_tokens: 100,
      input_tokens_details: { cached_tokens: 0, cache_write_tokens: 0 },
      output_tokens: 20,
      output_tokens_details: { reasoning_tokens: 5 },
      total_tokens: 120,
      ...usage,
    },
  };
}

test('parseArgs requires selected fields and an explicit scope', () => {
  assert.throws(() => parseArgs(['guides']), /--title or --description/);
  assert.throws(() => parseArgs(['--title']), /Provide one or more/);
  assert.throws(() => parseArgs(['--title', '--all', 'guides']), /cannot be combined/);
  assert.deepEqual(
    parseArgs(['--', '--title', '--description', '--patch', '--dry-run', 'guides']),
    {
      title: true,
      description: true,
      patch: true,
      dryRun: true,
      all: false,
      yes: false,
      help: false,
      model: process.env.OPENAI_MODEL || 'gpt-6-astra',
      paths: ['guides'],
    },
  );
});

test('loadEnvironment reads repository-root .env without replacing shell variables', () => {
  const root = createRepository({
    '.env': 'SEO_METADATA_ENV_TEST=from-file\nSEO_METADATA_ENV_EXISTING=from-file\n',
  });
  const previousLoaded = process.env.SEO_METADATA_ENV_TEST;
  const previousExisting = process.env.SEO_METADATA_ENV_EXISTING;
  process.env.SEO_METADATA_ENV_EXISTING = 'from-shell';
  delete process.env.SEO_METADATA_ENV_TEST;
  try {
    assert.equal(loadEnvironment(root), true);
    assert.equal(process.env.SEO_METADATA_ENV_TEST, 'from-file');
    assert.equal(process.env.SEO_METADATA_ENV_EXISTING, 'from-shell');
  } finally {
    if (previousLoaded === undefined) delete process.env.SEO_METADATA_ENV_TEST;
    else process.env.SEO_METADATA_ENV_TEST = previousLoaded;
    if (previousExisting === undefined) delete process.env.SEO_METADATA_ENV_EXISTING;
    else process.env.SEO_METADATA_ENV_EXISTING = previousExisting;
    rmSync(root, { recursive: true, force: true });
  }
});

test('loadEnvironment accepts a missing .env file', () => {
  const root = createRepository({});
  try {
    assert.equal(loadEnvironment(root), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('article eligibility excludes synchronized and non-article content', () => {
  assert.equal(isEligibleArticle('index.md'), true);
  assert.equal(isEligibleArticle('guides/example.md'), true);
  assert.equal(isEligibleArticle('resources/references/adr/example.md'), false);
  assert.equal(isEligibleArticle('resources/guidelines/code/core/example.md'), false);
  assert.equal(isEligibleArticle('snippets/example.md'), false);
});

test('resolveArticlePaths uses only tracked eligible Markdown files', () => {
  const root = createRepository({
    'guides/one.md': '# One\n',
    'guides/two.md': '# Two\n',
    'resources/references/adr/synced.md': '# Synced\n',
    'snippets/example.md': '# Snippet\n',
  });
  try {
    const tracked = [
      'guides/one.md',
      'guides/two.md',
      'resources/references/adr/synced.md',
      'snippets/example.md',
    ];
    assert.deepEqual(resolveArticlePaths({ all: false, paths: ['guides'] }, root, tracked), [
      'guides/one.md',
      'guides/two.md',
    ]);
    assert.throws(
      () => resolveArticlePaths({ all: false, paths: ['resources/references/adr/synced.md'] }, root, tracked),
      /Synchronized content is excluded/,
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('patch mode requests only missing selected fields', () => {
  const article = parseArticle(`---\nnav:\n  title: Existing\nmeta:\n  description: ${validDescription()}\n---\n\n# Existing\n`);
  assert.deepEqual(requestedFields({ title: true, description: true, patch: true }, article, 'test.md'), []);
  article.document.deleteIn(['meta', 'description']);
  assert.deepEqual(
    requestedFields({ title: true, description: true, patch: true }, article, 'test.md'),
    ['description'],
  );
  assert.deepEqual(
    requestedFields({ title: true, description: true, patch: false }, article, 'test.md'),
    ['title', 'description'],
  );
});

test('request schema and count request contain only requested fields and countable parameters', () => {
  const article = parseArticle('# Article\nBody.\n');
  const item = { path: 'guides/article.md', article, fields: ['description'] };
  const request = buildRequest(item, 'gpt-6-astra');
  assert.deepEqual(responseSchema(item.fields).required, ['description']);
  assert.equal(request.text.format.schema.properties.title, undefined);
  assert.equal(request.max_output_tokens, MAX_OUTPUT_TOKENS);
  assert.deepEqual(buildCountRequest(request), {
    model: request.model,
    instructions: request.instructions,
    input: request.input,
    text: request.text,
    reasoning: request.reasoning,
  });
});

test('token counting uses the typed OpenAI SDK endpoint', async () => {
  let observed;
  const result = await countInputTokens({
    responses: {
      inputTokens: {
        count: async (body) => {
          observed = body;
          return { input_tokens: 321 };
        },
      },
    },
  }, {
    model: 'gpt-6-astra',
    instructions: 'Instructions',
    input: 'Article',
    text: { format: { type: 'json_schema' } },
    reasoning: { effort: 'low' },
    max_output_tokens: MAX_OUTPUT_TOKENS,
    store: false,
  });
  assert.equal(result.input_tokens, 321);
  assert.equal(observed.max_output_tokens, undefined);
  assert.equal(observed.store, undefined);
});

test('applyMetadata creates nested frontmatter and migrates legacy descriptions', () => {
  const source = '---\ndescription: Legacy description\ncustom: keep\n---\n\n# Article\n';
  const article = parseArticle(source);
  const item = { article };
  const description = validDescription('z');
  const updated = applyMetadata(item, { title: 'Generated title', description });
  const reparsed = parseArticle(updated);
  assert.equal(reparsed.document.getIn(['nav', 'title']), 'Generated title');
  assert.equal(reparsed.document.getIn(['meta', 'description']), description);
  assert.equal(reparsed.document.get('description'), undefined);
  assert.equal(reparsed.document.get('custom'), 'keep');
  assert.equal(reparsed.body, '\n# Article\n');
});

test('cost calculations include cache classes without double-counting reasoning tokens', () => {
  const pricing = catalog.models['gpt-6-astra'];
  const estimate = estimateCost(1_000, pricing, 500);
  assert.equal(estimate.minimumCost, 0.01);
  assert.equal(estimate.maximumCost, 0.035);

  const actual = calculateActualCost({
    input_tokens: 1_000,
    input_tokens_details: {
      cached_tokens: 200,
      cache_write_tokens: 300,
      cache_write_tokens_details: { ttl_30m_tokens: 100, ttl_12h_tokens: 200 },
    },
    output_tokens: 100,
    output_tokens_details: { reasoning_tokens: 80 },
    total_tokens: 1_100,
  }, pricing);
  assert.equal(actual.uncachedInputTokens, 500);
  assert.equal(actual.reasoningTokens, 80);
  assert.equal(actual.cost, 0.01645);
});

test('long-context multipliers and unknown model failures are enforced', () => {
  const pricing = catalog.models['gpt-6-astra'];
  const estimate = estimateCost(272_001, pricing, 100);
  assert.equal(estimate.minimumCost, 5.44002);
  assert.equal(estimate.maximumCost, 5.44752);
  assert.throws(() => assertPricing(catalog, 'unknown-model'), /No pricing is configured/);
});

test('unified diff uses repository paths and contains the metadata change', () => {
  const diff = createUnifiedDiff('guides/article.md', '# Old\n', '# New\n');
  assert.match(diff, /^--- a\/guides\/article\.md/m);
  assert.match(diff, /^\+\+\+ b\/guides\/article\.md/m);
  assert.match(diff, /^-# Old$/m);
  assert.match(diff, /^\+# New$/m);
});

test('article manifest is printed before client construction and generation needs a second approval', async () => {
  const root = createRepository({ 'guides/article.md': '# Article\nUseful content.\n' });
  const io = memoryIo();
  const events = [];
  try {
    const result = await runCli(['--title', 'guides/article.md'], {
      root,
      trackedFiles: ['guides/article.md'],
      catalog,
      io,
      apiKey: 'test',
      approve: async (question) => {
        events.push(question);
        if (events.length === 1) {
          assert.match(io.output(), /guides\/article\.md \[title\]/);
          return true;
        }
        assert.match(io.output(), /Token and cost preflight/);
        return false;
      },
      createClient: async () => {
        events.push('client-created');
        return {
          responses: {
            inputTokens: { count: async () => ({ input_tokens: 123 }) },
            create: async () => { throw new Error('generation should not run'); },
          },
        };
      },
    });
    assert.equal(result.status, 'cancelled-before-generation');
    assert.deepEqual(events, [
      'Send the listed articles to OpenAI for exact token counting?',
      'client-created',
      'Proceed with metadata generation at the displayed cost range?',
    ]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('rejection at the article gate makes no client or external request', async () => {
  const root = createRepository({ 'guides/article.md': '# Article\n' });
  const io = memoryIo();
  let created = false;
  try {
    const result = await runCli(['--title', 'guides/article.md'], {
      root,
      trackedFiles: ['guides/article.md'],
      catalog,
      io,
      approve: async () => false,
      createClient: async () => { created = true; },
    });
    assert.equal(result.status, 'cancelled-before-count');
    assert.equal(created, false);
    assert.match(io.output(), /Cancelled before making external requests/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('patch-mode no-op exits before credentials or client construction', async () => {
  const source = '---\nnav:\n  title: Existing title\n---\n\n# Article\n';
  const root = createRepository({ 'guides/article.md': source });
  const io = memoryIo({ isTTY: false });
  let created = false;
  try {
    const result = await runCli(['--title', '--patch', 'guides/article.md'], {
      root,
      trackedFiles: ['guides/article.md'],
      catalog,
      io,
      createClient: async () => { created = true; },
    });
    assert.equal(result.status, 'noop');
    assert.equal(created, false);
    assert.match(io.output(), /Articles to transmit: 0/);
    assert.match(io.output(), /Nothing to generate; no external requests were made/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('--yes dry-run reports tokens and cost and leaves the article unchanged', async () => {
  const original = '# Article\nUseful content.\n';
  const root = createRepository({ 'guides/article.md': original });
  const io = memoryIo({ isTTY: false });
  const countedRequests = [];
  try {
    const result = await runCli(['--title', '--description', '--yes', '--dry-run', 'guides/article.md'], {
      root,
      trackedFiles: ['guides/article.md'],
      catalog,
      io,
      apiKey: 'test',
      createClient: async () => ({
        responses: {
          inputTokens: {
            count: async (request) => {
              countedRequests.push(request);
              return { input_tokens: 250 };
            },
          },
          create: async () => completedResponse({
            title: 'Generated title',
            description: validDescription(),
          }),
        },
      }),
    });
    assert.equal(result.status, 'previewed');
    assert.equal(readFileSync(path.join(root, 'guides/article.md'), 'utf8'), original);
    assert.equal(countedRequests.length, 1);
    assert.equal('max_output_tokens' in countedRequests[0], false);
    assert.match(io.output(), /Estimated API cost:/);
    assert.match(io.output(), /Calculated API cost:/);
    assert.match(io.output(), /^\+  title: Generated title$/m);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('successful generation writes validated nested metadata', async () => {
  const original = '---\ndescription: Legacy\ncustom: retained\n---\n\n# Article\nUseful content.\n';
  const root = createRepository({ 'guides/article.md': original });
  const io = memoryIo({ isTTY: false });
  try {
    const result = await runCli(['--title', '--description', '--yes', 'guides/article.md'], {
      root,
      trackedFiles: ['guides/article.md'],
      catalog,
      io,
      apiKey: 'test',
      createClient: async () => ({
        responses: {
          inputTokens: { count: async () => ({ input_tokens: 250 }) },
          create: async () => completedResponse({
            title: 'Generated title',
            description: validDescription('q'),
          }),
        },
      }),
    });
    assert.equal(result.status, 'updated');
    const updated = parseArticle(readFileSync(path.join(root, 'guides/article.md'), 'utf8'));
    assert.equal(updated.document.getIn(['nav', 'title']), 'Generated title');
    assert.equal(updated.document.getIn(['meta', 'description']), validDescription('q'));
    assert.equal(updated.document.get('description'), undefined);
    assert.equal(updated.document.get('custom'), 'retained');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('generation failures report observed usage and do not partially write files', async () => {
  const originals = {
    'guides/one.md': '# One\n',
    'guides/two.md': '# Two\n',
  };
  const root = createRepository(originals);
  const io = memoryIo();
  let call = 0;
  try {
    await assert.rejects(
      runCli(['--title', '--yes', 'guides'], {
        root,
        trackedFiles: ['guides/one.md', 'guides/two.md'],
        catalog,
        io,
        apiKey: 'test',
        createClient: async () => ({
          responses: {
            inputTokens: { count: async () => ({ input_tokens: 100 }) },
            create: async () => {
              call += 1;
              if (call === 1) return completedResponse({ title: 'First title' });
              return { ...completedResponse({ title: 'Second title' }), output_text: '{bad json' };
            },
          },
        }),
      }),
      /malformed JSON/,
    );
    assert.equal(readFileSync(path.join(root, 'guides/one.md'), 'utf8'), originals['guides/one.md']);
    assert.equal(readFileSync(path.join(root, 'guides/two.md'), 'utf8'), originals['guides/two.md']);
    assert.match(io.output(), /Observed usage and calculated API cost/);
    assert.match(io.output(), /guides\/one\.md/);
    assert.match(io.output(), /guides\/two\.md/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('refusals, incomplete responses, Joi failures, and network errors do not write files', async () => {
  const scenarios = [
    {
      expected: /refused/,
      response: {
        ...completedResponse({ title: 'Unused' }),
        output: [{ content: [{ type: 'refusal', refusal: 'Cannot process this article.' }] }],
      },
    },
    {
      expected: /max_output_tokens/,
      response: {
        ...completedResponse({ title: 'Unused' }),
        status: 'incomplete',
        incomplete_details: { reason: 'max_output_tokens' },
      },
    },
    {
      expected: /Invalid metadata/,
      response: completedResponse({ title: 'x'.repeat(61) }),
    },
    {
      expected: /network unavailable/,
      error: new Error('network unavailable'),
    },
  ];

  for (const scenario of scenarios) {
    const original = '# Article\n';
    const root = createRepository({ 'guides/article.md': original });
    const io = memoryIo({ isTTY: false });
    try {
      await assert.rejects(
        runCli(['--title', '--yes', 'guides/article.md'], {
          root,
          trackedFiles: ['guides/article.md'],
          catalog,
          io,
          apiKey: 'test',
          createClient: async () => ({
            responses: {
              inputTokens: { count: async () => ({ input_tokens: 100 }) },
              create: async () => {
                if (scenario.error) throw scenario.error;
                return scenario.response;
              },
            },
          }),
        }),
        scenario.expected,
      );
      assert.equal(readFileSync(path.join(root, 'guides/article.md'), 'utf8'), original);
      assert.match(io.output(), /Observed usage and calculated API cost/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  }
});

test('non-interactive execution without --yes stops after printing the manifest', async () => {
  const root = createRepository({ 'guides/article.md': '# Article\n' });
  const io = memoryIo({ isTTY: false });
  try {
    await assert.rejects(
      runCli(['--title', 'guides/article.md'], {
        root,
        trackedFiles: ['guides/article.md'],
        catalog,
        io,
      }),
      (error) => error instanceof CliError && /Non-interactive runs require --yes/.test(error.message),
    );
    assert.match(io.output(), /Article preflight/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
