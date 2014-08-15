![Build Status](https://magnum.travis-ci.com/OpenSOC/opensoc-ui.svg?token=jo4ZVAV7CXvqp5459Gzo&branch=master)

opensoc-ui
==========

User interface for OpenSOC

## Hacking

### Step 1: Install Virtualbox and Vagrant

Download the latest package for your platform here:

1. [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
2. [Vagrant](https://www.vagrantup.com/downloads.html)

### Step 2: Clone repo

```bash
git clone git@github.com:OpenSOC/opensoc-ui.git
cd opensoc-ui
```

### Step 3: Download and provision the development environment

```bash
vagrant up
```

You might see a couple warnings, but usually these can be ignored. Check for any obvious errors as this can cause problems running the portal later.

### Step 4: SSH into the vm
All dependencies will be installed in the VM. The repository root is shared between the host and VM. The shared volume is mounted at /vagrant. Use the following command to ssh into the newly built VM:

```bash
vagrant ssh
cd vagrant
```

###  Step 5: Seed the development VM

This will populate dummy data from data/*.json into the Elasticsearch development instance.

Take a look at the [fetch](script/fetch.js) script to ensure it's pulling from the proper indices. Then run it like so:

```bash
ES_HOST=changeme.com script/es_fetch
```

This will save JSON data in an ES bulk-loadable format into ```seed/es/[index name].json```. Then, you can throw this into ES with:

```bash
script/es_seed
```

Of course, you can always populate your ES indices as you see fit.


For authentication, make sure you set up the LDAP directory structure with:

```bash
script/ldap_seed
```

### Step 6: Ensure tests pass

You can now run the tests:

```bash
make test
```

### Step 7: Launch the server

The ```nodemon``` utility automatically watches for changed files and reloads the node server automatically. Run the following commands from with the vagrant vm.

```bash
vagrant ssh
cd /vagrant
npm install -g nodemon
nodemon
```

You can then access the OpenSOC ui at ```http://localhost:5000```.
