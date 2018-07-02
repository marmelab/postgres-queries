.PHONY: help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install Dependencies
	yarn install

test: ## Run Unit Tests
	NODE_ENV=test ./node_modules/.bin/jest

test-watch: ## Run Unit Tests Using Watch Mode
	NODE_ENV=test ./node_modules/.bin/jest --watch
