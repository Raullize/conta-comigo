#!/bin/sh

set -e

node src/seeders/seed.js

exec "$@"