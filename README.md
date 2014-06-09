![Build Status](https://magnum.travis-ci.com/OpenSOC/opensoc-ui.svg?token=jo4ZVAV7CXvqp5459Gzo&branch=master)

opensoc-ui
==========

User interface for OpenSOC

## Hacking

### Step 1: Ensure you have a proper Node ~> 0.10.x installed

If you're on a Mac, [Homebrew](http://brew.sh) is the recommended way to install NodeJS with ```brew install node```.

[Here](.jshintrc) is a sample jshintrc file. Make sure to save it as ```.jshintrc``` in your home directory.

### Step 2: Install Virtualbox and Vagrant

Download the latest package for your platform here:

1. [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
2. [Vagrant](https://www.vagrantup.com/downloads.html)

### Step 3: Install library dependencies

```bash
git clone git@github.com:OpenSOC/opensoc-ui.git
cd opensoc-ui
npm install
```

### Step 4: Download and provision the development environment

```bash
vagrant up
```

You might see a couple warnings, but usually these can be ignored. Check for any obvious errors as this can cause problems running the portal later.

### Step 5: Migrate the DB

You'll need to migrate the database for both the development (default) and test environments:

```bash
script/migrate up
script/migrate up -e test
```

You should see no errors.

###  Step 6: Seed the development VM

This will populate dummy data from data/*.json into the Elasticsearch development instance.

First, take a look at the [fetch](script/fetch.js) script to ensure it's pulling from the proper indices. Then run it like so:

```bash
ES_HOST=changeme.com script/es_fetch
```

This will save JSON data in an ES bulk-loadable format into ```seed/es/[index name].json```. Then, you can throw this into ES with:

```bash
script/es_seed
```

Of course, you can always populate your ES indices as you see fit.

For Postgres, there's ```script/pg_seed``` which loads the seed data from ```seed/pg/*.json``` into Postgres.

For authentication, make sure you set up the LDAP directory structure with:

```bash
script/ldap_seed
```

### Step 7: Ensure tests pass

You can now run the tests:

```bash
make test
```

### Step 8: Launch the server

The ```nodemon``` utility automatically watches for changed files and reloads the node server automatically.

```bash
npm install -g nodemon
nodemon
```

You can then access the OpenSOC ui at ```http://localhost:5000```.
