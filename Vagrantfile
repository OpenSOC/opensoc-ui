# -*- mode: ruby -*-
# vi: set ft=ruby :

# Vagrantfile API/syntax version. Don't touch unless you know what you're doing!
VAGRANTFILE_API_VERSION = "2"

Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.vm.box = "ubuntu/trusty64"
  config.vm.provision "shell", path: 'script/provision'

  # Use SSH agent for key forwarding
  config.ssh.forward_agent

  # Nodemon server
  config.vm.network :forwarded_port, guest: 5601, host: 5601

  # Elasticsearch
  config.vm.network :forwarded_port, guest: 9200, host: 9200

  config.vm.network "private_network", ip: "192.168.33.101"

  config.vm.provider "virtualbox" do |vb|
    vb.customize ["modifyvm", :id, "--memory", "2048"]
  end

end
