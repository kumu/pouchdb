test:
	grunt node-qunit

install:
	cp dist/pouchdb-nightly.js ../../kumu/vendor/assets/javascripts/auto/couch/

.PHONY: test
