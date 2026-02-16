#!/bin/sh
set -e

echo "Waiting to database be ready"
until npx prisma migrate deploy; do
  echo "Database not ready yet"
  sleep 2
done

echo "Running migrations"
npx prisma migrate deploy

echo "Starting app"
exec node dist/src/main.js