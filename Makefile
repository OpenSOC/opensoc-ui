test: test-all

test-all:
	PORT=4000 NODE_ENV=test ./node_modules/istanbul/lib/cli.js cover \
		./node_modules/mocha/bin/_mocha -- --check-leaks -R spec

# Load test data into DB
seed:
	node script/es_fetch.js && script/es_seed.sh

clean:
	rm -rf ./node_modules ./coverage ./.bundle
