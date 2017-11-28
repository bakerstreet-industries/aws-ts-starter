#!/usr/bin/env bash

serverless deploy

# Parse out the http endpoint
endpoint="$(serverless info | grep POST - | sed 's/POST - //')"

# Replace the module tests.e2e.ts endpoint token
# Sadly, my SED skills are lacking and I could not find a way to do a simple string replacement because of the slashes in the endpoint. Dumping out the responsibility to gulp.
gulp --endpoint ${endpoint}

# Deploy function updates
serverless deploy --function module-post
serverless deploy --function module-del
serverless deploy --function module-get
serverless deploy --function module-pu

# Run the integration tests
nyc mocha **/*.e2e.ts