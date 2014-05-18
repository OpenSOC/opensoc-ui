test: test-all

test-all:
	PORT=4000 NODE_ENV=test ./node_modules/istanbul/lib/cli.js cover \
		./node_modules/mocha/bin/_mocha -- --check-leaks -R spec

# Load test data into DB
# TODO: name indexes properly
seed:
	node script/seed.js; for f in data/*.json; do curl -XPUT -d @$$f 'http://localhost:9200/$$f' ; done

clean:
	rm -rf ./node_modules ./coverage ./.bundle
