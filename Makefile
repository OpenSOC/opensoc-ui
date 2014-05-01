test: test-all

test-all:
	PORT=4000 NODE_ENV=test ./node_modules/istanbul/lib/cli.js cover \
		./node_modules/mocha/bin/_mocha -- --check-leaks -R spec
