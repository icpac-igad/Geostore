# Global Forest Watch Geostore API

[![Build Status](https://travis-ci.org/gfw-api/gfw-geostore-api.svg?branch=develop)](https://travis-ci.org/gfw-api/gfw-geostore-api)
[![Test Coverage](https://api.codeclimate.com/v1/badges/896da4f09a0ebb049753/test_coverage)](https://codeclimate.com/github/gfw-api/gfw-geostore-api/test_coverage)

This repository is the microservice that implements the Geostore
functionality, which is exposed on the /geostore endpoint.

The Geostore is a simple GeoJSON storage service that receives GeoJSON
and returns an ID that can be used later to retrieve the given object.
It is used primarily by the GFW map to handle large GeoJSON objects that
could not normally be stored in the URL.

[View the documentation for this
API](http://gfw-api.github.io/swagger-ui/?url=https://raw.githubusercontent.com/gfw-api/gfw-geostore-api/master/app/microservice/swagger.yml#/GeoStore)

1. [Getting Started](#getting-started)
2. [Deployment](#deployment)

## Getting Started

## First time user
Perform the following steps:
* [Install docker && docker composse](https://docs.docker.com/engine/installation/)
* [Install control tower](https://github.com/control-tower/control-tower)
* Clone this repository: ```git clone git@github.com:gfw-api/gfw-geostore-api.git```
* Enter in the directory ```cd gfw-geostore-api```
* Open a terminal and run:

```bash
    sh ./geostore.sh develop

```


## Deployment

The application is deployed to Heroku. Setup Heroku for the repository:

```
heroku git:remote -a gfw-geostore-api-staging -r staging
```

And deploy as normal:

```
git push staging master
```

### Configuration

It is necessary to define these environment variables:

* API_GATEWAY_URI => Gateway Service API URL
* NODE_ENV => Environment (prod, staging, dev)
