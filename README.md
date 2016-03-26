# Global Forest Watch Geostore API

This repository is the microservice that implements the Geostore
funcionality, which is exposed on the /geostore endpoint.

The Geostore is a simple GeoJSON storage service that receives GeoJSON
and returns an ID that can be used later to retrieve the given object.
It is used primarily by the GFW map to handle large GeoJSON objects that
could not normally be stored in the URL.

1. [Getting Started](#getting-started)
2. [Deployment](#deployment)

## Getting Started

### OS X

**First, make sure that you have the [API gateway running
locally](https://github.com/Vizzuality/api-gateway/tree/master#getting-started).**

We're using Docker which, luckily for you, means that getting the
application running locally should be fairly painless. First, make sure
that you have [Docker Compose](https://docs.docker.com/compose/install/)
installed on your machine.

If you've not used Docker before, you may need to set up some defaults:

```
docker-machine create --driver virtualbox default
docker-machine start default
eval $(docker-machine env default)
```

Now we're ready to actually get the application running:

```
git clone https://github.com/Vizzuality/gfw-geostore-api.git
cd gfw-geostore-api
npm install
npm run develop
```

You can now access the microservice through the API gateway.

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

* API_GATEWAY_URI => Gateway Serice API URL
* NODE_ENV => Environment (prod, staging, dev)
