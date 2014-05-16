#!/usr/bin/env sh

# This file is meant to be executed inside the Vagrant development VM

### BEGIN POSTGRESQL ###
echo 'deb http://apt.postgresql.org/pub/repos/apt/ trusty-pgdg main' > /etc/apt/sources.list.d/pgdg.list
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | apt-key add -
apt-get update
apt-get -y install postgresql-9.3
service postgresql restart
### END POSTGRESQL ###


### BEGIN REDIS ###
apt-get -y install redis-server
update-rc.d redis-server defaults 95 10
sed -i '/bind 127.0.0.1/c\bind 0.0.0.0' /etc/redis/redis.conf
service redis-server restart
### END REDIS ###

### BEGIN ELASTICSEARCH ###
apt-get -y install openjdk-7-jre-headless
wget --quiet https://download.elasticsearch.org/elasticsearch/elasticsearch/elasticsearch-1.1.1.deb
dpkg -i elasticsearch-1.1.1.deb
cd /usr/share/elasticsearch
bin/plugin -install mobz/elasticsearch-head
cd -
update-rc.d elasticsearch defaults 95 10
service elasticsearch restart
### END ELASTICSEARCH ###

### BEGIN KAFKA ###
wget --quiet http://mirror.cc.columbia.edu/pub/software/apache/kafka/0.8.1.1/kafka_2.10-0.8.1.1.tgz
tar zxvf kafka_2.10-0.8.1.1.tgz
echo 'advertised.host.name=192.168.33.10' >> kafka_2.10-0.8.1.1.tgz/config/server.properties
chown -R vagrant kafka_2.10-0.8.1.1

# zookeeper-server startup script
rm /etc/init/zookeeper-server.conf
echo 'description "Zookeeper Server"' >> /etc/init/zookeeper-server.conf
echo 'start on started networking' >> /etc/init/zookeeper-server.conf
echo 'stop on runlevel [016]' >> /etc/init/zookeeper-server.conf
echo 'exec su - vagrant -c "cd ~vagrant/kafka_2.10-0.8.1.1 ; bin/zookeeper-server-start.sh config/zookeeper.properties"' >> /etc/init/zookeeper-server.conf
echo 'respawn' >> /etc/init/zookeeper-server.conf
echo 'respawn limit 3 60' >> /etc/init/zookeeper-server.conf
service zookeeper-server restart

# kafka-server startup script
rm /etc/init/kafka-server.conf
echo 'description "Kafka Server"' >> /etc/init/kafka-server.conf
echo 'start on started networking' >> /etc/init/kafka-server.conf
echo 'stop on runlevel [016]' >> /etc/init/kafka-server.conf
echo 'exec su - vagrant -c "cd ~vagrant/kafka_2.10-0.8.1.1 ; bin/kafka-server-start.sh config/server.properties"' >> /etc/init/kafka-server.conf
echo 'respawn' >> /etc/init/kafka-server.conf
echo 'respawn limit 3 60' >> /etc/init/kafka-server.conf
service kafka-server restart

# Create OpenSOC Kafka topic
sleep 3
su - vagrant -c "cd kafka_2.10-0.8.1.1; bin/kafka-topics.sh --create --topic opensoc --zookeeper localhost:2181 --partitions 1 --replication-factor 1"
### END KAFKA ###
