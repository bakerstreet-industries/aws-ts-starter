#!/usr/bin/env bash

serverless deploy

# Parse out the http endpoint
endpoint="$(serverless info | grep POST - | sed 's/POST - //')"
echo "${endpoint}"

# Replace the module tests.spec.ts endpoint token
# Sadly, I could not find a way to do a simple string replacement using SED because of the slashes in the endpoint. Dumping out the responsibility to gulp
gulp --endpoint ${endpoint}

# Run the integration tests
npm run e2e