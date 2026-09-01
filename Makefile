#! /usr/bin/env make

user := "$(shell id -u):$(shell id -g)"
ignored = '/docs/resources/references/adr/* /docs/assets/adr/* /docs/resources/guidelines/code/core/* /docs/snippets/guide/* /docs/resources/references/app-reference/*'
image = ghcr.io/rojopolis/spellcheck-github-actions:0.49.0

lychee_image = lycheeverse/lychee:0.24.2
# Keep HTTPS args in sync with .github/workflows/validate-external-links.yml.
# --root-dir points at a non-existent path so portal root-relative links
# (/frontends/, /docs/, /resources/…) are skipped instead of failing as local files.
lychee_args = --retry-wait-time 10 --max-retries 3 --timeout 30 --accept=200,403,429,408 -s "https" --exclude "https://github.com/\[your*" --exclude "https://localhost:9200" --root-dir /var/empty

.PHONY : help spellcheck spellcheck-local fix linkcheck
.DEFAULT_GOAL : help

# This will output the help for each task. thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## Show this help
	@printf "\033[33m%s:\033[0m\n" 'Available commands'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

spellcheck: ## Runs the spellcheck tool (via Docker)
	docker run --rm -u ${user} -v "$(shell pwd):/docs" -w /docs -e INPUT_IGNORE=${ignored} ${image} \
	    --config /docs/markdown-style-config.yml /docs

spellcheck-local: ## Deprecated alias for spellcheck
	@$(MAKE) spellcheck

fix: ## Runs the linting tool and fixes simple mistakes
	docker run --rm -u ${user} -v "$(shell pwd):/docs" -e INPUT_FIX=true -e INPUT_IGNORE=${ignored} avtodev/markdown-lint:v1.5 \
	    --config /docs/markdown-style-config.yml /docs

linkcheck: ## Check HTTPS links in Markdown (via Docker / Lychee). Optional: DIR=path/to/folder
	docker run --init --rm -w /input -v "$(shell pwd):/input" ${lychee_image} \
	    ${lychee_args} --no-progress "$(if $(DIR),$(DIR)/**/*.md,**/*.md)"
