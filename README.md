opensoc-ui
==========

User interface for OpenSOC

## Hacking

### Step 1: Ensure you have Node >= 0.10.26 and a proper jshintrc installed

If you're on a Mac, [Homebrew](http://brew.sh) is the recommended way to install NodeJS.

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

You might see a couple warnings, but usually these can be safely ignored. Note that you need to shut down any services which conflict with the ports specified in the Vagrantfile. If you get the following error, you need to shut down your host services before provisioning the VM:

```
Vagrant cannot forward the specified ports on this VM, since they
would collide with some other application that is already listening
on these ports. The forwarded port to 9200 is already in use
on the host machine.

To fix this, modify your current projects Vagrantfile to use another
port. Example, where '1234' would be replaced by a unique host port:

  config.vm.network :forwarded_port, guest: 9200, host: 1234

Sometimes, Vagrant will attempt to auto-correct this for you. In this
case, Vagrant was unable to. This is usually because the guest machine
is in a state which doesn't allow modifying port forwarding.
```

###  Step 5: Seed the development VM

This will populate dummy data from data/*.json into the Elasticsearch development instance.

```bash
node script/seed.js
```

### Step 6: Ensure tests pass

You can now run the tests:

```bash
make test
```
