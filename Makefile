test: test-all

test-all:
ifeq ($(IN_TRAVIS),true)
	PORT=4000 NODE_ENV=ci ./node_modules/istanbul/lib/cli.js cover \
		./node_modules/mocha/bin/_mocha -- --check-leaks -R spec
else
	PORT=4000 NODE_ENV=test ./node_modules/istanbul/lib/cli.js cover \
		./node_modules/mocha/bin/_mocha -- --check-leaks -R spec
endif

# Load test data into DB
seed:
	node script/es_fetch.js && script/es_seed.sh

clean:
	rm -rf ./node_modules ./coverage

