#!/usr/bin/env bash

serverless deploy

if grep [[ENDPOINT]] ./module/tests/e2e.ts
then
    # Parse out the http endpoint
    endpoint="$(serverless info | grep POST - | sed 's/POST - //')"

    # Replace the module tests.e2e.ts endpoint token
    # Sadly, my SED skills are lacking and I could not find a way to do a simple string replacement because of the slashes in the endpoint. Dumping out the responsibility to gulp.
    gulp --endpoint ${endpoint}
fi

# Run the integration tests
nyc mocha **/e2e.ts