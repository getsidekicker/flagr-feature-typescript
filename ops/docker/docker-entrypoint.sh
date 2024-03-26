#!/bin/bash
set -e

npm install

if [[ "${FEATURE_FLAGR_URL-false}" != "false" ]]; then
    wait-for "${FEATURE_FLAGR_URL}/api/v1/health"
fi

exec "$@"
