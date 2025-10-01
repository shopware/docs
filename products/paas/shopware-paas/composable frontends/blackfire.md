---
nav:
  title: Blackfire Continuous Profiling of Nuxt.js
  position: 20

---

# Blackfire Continuous Profiling of Nuxt.js

It's possible to enable [Blackfire Continuous Profiling](https://www.blackfire.io/continuous-profiler/) on a frontend based on Nuxt.js.

1. Install the BlackFire Node.js Lib: `npm install @blackfireio/node-tracing`

2. Add `./server/plugins/blackfire.ts`:

```ts
// server/plugins/blackfire.ts
export default defineNitroPlugin(async () => {
  if (process.env.BLACKFIRE_ENABLE !== '1') return;

  try {
    // Works in ESM: dynamically import and handle both default/named exports
    const mod = await import('@blackfireio/node-tracing');
    const Blackfire: any = (mod as any).default || mod;

    Blackfire.start({
      appName:
        process.env.BLACKFIRE_APP_NAME || 'shopware-frontend',
      // durationMillis: 45000,
      // cpuProfileRate: 100,
      // labels: { service: 'frontend', framework: 'nuxt3' },
    });

    console.info('[blackfire] node-tracing started');
  } catch (e) {
    console.error('[blackfire] failed to start node-tracing', e);
  }
});
```

3. Add the environment variable `BLACKFIRE_ENABLE=1`
