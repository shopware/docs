#! /usr/bin/env make

user := "$(shell id -u):$(shell id -g)"
ignored = '/docs/resources/references/adr/* /docs/assets/adr/* /docs/resources/guidelines/code/core/* /docs/snippets/guide/*'
image = ghcr.io/rojopolis/spellcheck-github-actions:0.49.0

.PHONY : help spellcheck fix
.DEFAULT_GOAL : help

# This will output the help for each task. thanks to https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
help: ## Show this help
	@printf "\033[33m%s:\033[0m\n" 'Available commands'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[32m%-18s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

spellcheck: ## Runs the spellcheck tool
	docker run --rm -u ${user} -v "$(shell pwd):/docs" -w /docs -e INPUT_IGNORE=${ignored} ${image} \
	    --config /docs/markdown-style-config.yml /docs

fix: ## Runs the linting tool and fixes simple mistakes
	docker run --rm -u ${user} -v "$(shell pwd):/docs" -e INPUT_FIX=true -e INPUT_IGNORE=${ignored} avtodev/markdown-lint:v1.5 \
	    --config /docs/markdown-style-config.yml /docs
