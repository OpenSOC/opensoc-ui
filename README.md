![Build Status](https://magnum.travis-ci.com/OpenSOC/opensoc-ui.svg?token=jo4ZVAV7CXvqp5459Gzo&branch=master)

# OpenSOC UI

User interface for the OpenSOC platform. The user interface is a modified version of **Kibana 3** which is served by a node JS backend.
___

## Deployment


#### Step 1: Setup required services

OpenSOC UI requires access to the following services:

* ElasticSearch with OpenSOC data.
* PCAP Service for access to raw pcaps.
* Active Directory or LDAP for authentication.

In addition raw PCAP access is restricted to any set groups. If you are using OpenLDAP, you must configure the memberOf overlay to provide reverse group membership information. Once these services are up and running, you are ready to setup the OpenSOC UI.

#### Step 2: Install required packages

The commands in this section are for deployment on Ubuntu 14.04. These instructions will need to be altered for Ubuntu 12.04 as the nodejs package is too old. It should be straight forward to adapt these instructions to other architectures as long as you are able to install the required packages.

```bash
apt-get update
apt-get install -y git  # To checkout the repo
apt-get install -y libpcap-dev tshark nodejs npm
ln -s /usr/bin/nodejs /usr/bin/node
npm install -g pm2
```

#### Step 3: Get the code

```bash
git clone git@github.com:OpenSOC/opensoc-ui.git
cd opensoc-ui
git submodule update --init
```

#### Step 4: Install node modules

From the repo root run:

```bash
npm install --production
```

#### Step 5: Configure the UI

Before you can spin up the UI, you need to point it to the various services and configure other deployment specific settings. These settings should be added to a file named ```config.json``` that should live in the repo root. Below is a list of fields that the are expected:

###### ```secret```

A random string that serves as the application secret. This will be used to sign cookies.

###### ```elasticsearch```

Must be a JSON object with the following keys:
* ```url```: URI to OpenSOC ElasticSearch cluster.

###### ```ldap```

Must be a JSON object with the following keys:

* ```url```: URI to LDAP service.
* ```searchBase```: LDAP search base.
* ```adminDn```: LDAP admin distinguished name.
* ```adminPassword```: LDAP admin password.

###### ```pcap```

Must be a JSON object with the following keys:

* ```url```: URI to the OpenSOC PCAP API service. The PCAP service uses the prefix ```pcap/pcapGetter```. This should be included as it is a configurable in the PCAP service. For clarification, see the example config below.
* ```mock```: This should be set to ```false```.


###### ```permissions```

JSON object with the following keys:

* ```pcap```: List of AD/LDAP groups that should have access to raw pcap data.


##### Example ```config.json```

The following is an example ```config.json``` file. This config will not work for you in production but is meant to serve as an example. It assumes that ElasticSearch, LDAP, and the OpenSOC PCAP service are running on 192.168.100.1:

```json
{
  "secret": "b^~BN-IdQ9gdp5sa2K$N=d5DV06eN7Y",
  "elasticsearch": {
    "url": "http://192.168.100.1:9200"
  },
  "ldap": {
    "url": "ldap://192.168.100.1:389",
    "searchBase": "dc=opensoc,dc=dev",
    "searchFilter": "(mail={{username}})",
    "searchAttributes": ["cn", "uid", "mail", "givenName", "sn", "memberOf"],
    "adminDn": "cn=admin,dc=opensoc,dc=dev",
    "adminPassword": "opensoc"
  },
  "pcap": {
    "url": "http://192.168.100.1/pcap/pcapGetter",
    "mock": false
  },
  "permissions": {
    "pcap": ["cn=investigators,ou=groups,dc=opensoc,dc=dev"]
  }
}
```

#### Step 6: Start the node server

```bash
pm2 start index.js -i max --name "opensoc"
```

If all goes well the OpenSOC UI will be running on port 5000. Visit it in your browser and rejoice.

___

## Development


These instructions are only for local development on the OpenSOC UI. Development is done in an Ubuntu 1.04 virtual machine that is provisioned using vagrant. It is intended to provided an isolated environment with all the dependencies and services either installed or stubbed. None of these instructions should be used for deployments. If that was not clear enough, these instructions are **NOT FOR DEPLOYMENT**.

#### Step 1: Install Virtualbox and Vagrant

Download the latest package for your platform here:

1. [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
2. [Vagrant](https://www.vagrantup.com/downloads.html)

#### Step 2: Get the code

```bash
git clone git@github.com:OpenSOC/opensoc-ui.git
cd opensoc-ui
git submodule update --init
```

#### Step 3: Download and provision the development environment

```bash
vagrant up
```

You might see a couple warnings, but usually these can be ignored. Check for any obvious errors as this can cause problems running the portal later.

#### Step 4: SSH into the vm
All dependencies will be installed in the VM. The repository root is shared between the host and VM. The shared volume is mounted at /vagrant. Use the following command to ssh into the newly built VM:

```bash
vagrant ssh
cd /vagrant
```

####  Step 5: Seed the development VM

To generate seed data for use with the opensoc-ui, use the following command.

```bash
script/es_gen.js
```

On the other hand, to duplicate another ES installation use:

```bash
ES_HOST=changeme.com script/es_fetch.js
```

You should now have seed data in ```seed/es```. You can load this into the dev ES instance with:

```bash
script/es_seed
```

For authentication, make sure you set up the LDAP directory structure with:

```bash
script/ldap_seed
```

#### Step 6: Ensure tests pass

You can now run the tests:

```bash
make test
```

#### Step 7: Launch the server

The ```nodemon``` utility automatically watches for changed files and reloads the node server automatically. Run the following commands from with the vagrant vm.

```bash
vagrant ssh
cd /vagrant
npm install -g nodemon
nodemon
```

You can then access the OpenSOC ui at ```http://localhost:5000```.

Two default accounts: mail: joesmith@opensoc.dev, maryfodder@opensoc.dev
The default password is: opensoc
