#!/usr/bin/env sh

# Seed Elasticsearch
for file in seed/es/*.json
do
  curl -s -XPOST --data-binary @$file 'http://192.168.33.10:9200/_bulk'
done
