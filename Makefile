# Make sure we're always using the latest versions
build:
	npm install && npm run build

test:
	npm test

.PHONY: test
