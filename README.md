![Build Status](https://travis-ci.org/OpenSOC/opensoc-ui.svg?branch=master)

# OpenSOC UI

User interface for the OpenSOC platform. The UI is a modified version of **[Kibana 3](https://github.com/elasticsearch/kibana/tree/kibana3)** which is served by a node JS backend.
___

## Deployment


### Quick start

* Create a config file: ```echo "{}" > ~/.opensoc-ui```
* Install opensoc-ui: ```npm install -g opensoc-ui```
* Start opensoc-ui: ```opensoc-ui```

This will start the server in the same process. To start/stop a daemonized server use ```opensoc-ui start``` and ```opensoc-ui stop```. You can view the location of the log file with ```opensoc-ui logs```. The daemon is started using the ```forever``` node package. You can tack on other command line flags that the library supports. More information about this is available at https://www.npmjs.com/package/forever.

Next, head over to the "Configuration" section for more information about the config file.


### Indepth guide

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
apt-get install -y libpcap-dev tshark nodejs npm
ln -s /usr/bin/nodejs /usr/bin/node
npm install -g opensoc-ui
```

#### Step 3: Configure the UI

Before you can spin up the UI, you need to point it to the various services and configure other deployment specific settings. The application will look for an application config using in the following places in order:

* ```~/.opensoc-ui```
* Path specified by the environment variable ```OPENSOC_UI_CONFIG```
* Path specified by the npm package config setting ```path```. Once the package is installed, this can be set with ```npm config set opensoc-ui:path "/path/to/config.json"```

#### Step 4: Test the server
```bash
opensoc-ui
```

This will run the server without daemonizing that may make it easier to debug any issues with your setup. You can exit the test server with ```Ctrl+C```.

#### Step 5: Start daemonized server

```bash
opensoc-ui start
```

Incidentally, to stop the server use:

```bash
opensoc-ui stop
```

and to restart it use:

```bash
opensoc-ui restart
```

For logs:
```bash
opensoc-ui logs
```

___

## Configuration

The OpenSOC-UI is configured using a JSON file.

##### Fields

* ```auth```: Set to ```true``` to enable authentication with ldap.

* ```host```: IP address the server should listen on.

* ```port```: Port the server should listen on.

* ```secret```: A random string that used to sign cookies.

* ```elasticsearch```: Must be a JSON object with the following keys:
    * ```url```: URI to OpenSOC ElasticSearch cluster.

* ```ldap```: Only required if ```auth``` is set to true. Must be a JSON object with the following keys:
    * ```url```: URI to LDAP service.
    * ```searchBase```: LDAP search base.
    * ```adminDn```: LDAP admin distinguished name.
    * ```adminPassword```: LDAP admin password.

* ```pcap```: Must be a JSON object with the following keys:
    * ```url```: URI to the OpenSOC PCAP API service. The PCAP service uses the prefix ```pcap/pcapGetter```. This should be included as it is a configurable in the PCAP service. For clarification, see the example config below.
    * ```mock```: This should be set to ```false```.

* ```permissions```: Must be a JSON object with the following keys:
    * ```pcap```: List of AD/LDAP groups that should have access to raw pcap data.


##### Example config

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

___

## Development


These instructions are only for local development on the OpenSOC UI. Development is done in an Ubuntu 14.04(trusty) virtual machine that is provisioned using vagrant. It is intended to provided an isolated environment with all the dependencies and services either installed or stubbed. None of these instructions should be used for deployments. If that was not clear enough, these instructions are **NOT FOR DEPLOYMENT**.

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

#### Step 5: Ensure tests pass

You can now run the tests:

```bash
npm test
```

#### Step 6: Launch the server

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


### Seed data for development

When the VM is provisioned, elasticsearch and LDAP are provided some seed data to get you started. This fake data tries to mimic data from the OpenSOC platform to set you up for local development without running the entire platform. Occasionally, you may need to regenerate your seed data. To do this, use the following command.

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