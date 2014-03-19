build:
	npm run build

test:
	npm test

update:
	npm run build && cp dist/pouchdb-nightly.js ../../kumu/vendor/assets/javascripts/auto/couch/pouchdb.js

.PHONY: test
