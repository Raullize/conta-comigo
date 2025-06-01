#!/bin/sh

set -e

node src/seeders/seed.js -s

exec "$@"