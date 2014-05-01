Documentation
=============

JShintrc -- to provide for a uniform coding style across the application,
download the [jshintrc](jshintrc) file and save it as ```~/.jshintrc```.

## Dependencies

### Using Docker

The quickest way to get up and running with the OpenSOC Portal system dependencies is to use the Docker image. It assumes you're using OS X 10.9.2.

To install Docker on OS X, follow the instructions at http://docs.docker.io/installation/mac/. Once Docker is installed, you should be able to pull and run the OpenSOC Portal docker image with

```docker pull jamilbk/opensoc-ui:mac```

This will download a Docker image containing:

1. Elasticsearch 1.1.1
2. Postgres 9.3.4
3. Redis 2.8.9

You can then run the image with ```docker run jamilbk/opensoc-ui:mac```
