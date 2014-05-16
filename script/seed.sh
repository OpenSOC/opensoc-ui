#!/usr/bin/env sh

for file in data/*.json
do
  curl -s -XPOST --data-binary @$file 'http://192.168.33.10:9200/_bulk'
done
