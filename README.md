# GFW GeoStore API
This repository is the microservice that it implement the geostore funcionality and exposed the /geostore endpoint in the apigateway

## Installation in local

```bash
npm install

npm install -g bunyan  // logger system
```
## Run
Execute the next command: Environment available: dev, test, staging, prod

```bash
    NODE_ENV=<env> npm start
```

if you want see the logs formatted execute:

```bash
    NODE_ENV=<env> npm start | bunyan
```

## Execute test
```bash
    npm test
```

if you want see the logs formatted execute:

```bash
    npm test | bunyan
```

## Run in develop mode
We use grunt. Execute the next command:

```bash
    npm run develop
```

## Production and Staging installation environment
Is necessary define the next environment variables:

* API_GATEWAY_URI => Url the register of the API Gateway. Remember: If the authentication is active in API Gateway, add the username and password in the url
* NODE_ENV => Environment (prod, staging, dev)



## register.json
This file contain the configuration about the endpoints that public the microservice. This json will send to the apigateway. it can contain variables:
* #(service.id) => Id of the service setted in the config file by environment
* #(service.name) => Name of the service setted in the config file by environment
* #(service.uri) => Base uri of the service setted in the config file by environment
