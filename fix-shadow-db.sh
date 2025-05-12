#!/bin/bash

# Bring down any running containers
docker-compose down

# Add the --skip-generate flag to Prisma migrate command to avoid generating the client
# This prevents issues with the shadow database for existing migrations

# Start the containers with a modified command to skip generate and shadow db checks
docker-compose up -d --build --force-recreate \
  -e PRISMA_MIGRATE_SKIP_GENERATE=true \
  -e PRISMA_MIGRATE_SKIP_SHADOW_DATABASE=true

# Show message
echo "Starting containers with shadow database checks disabled..."
echo "If the app starts successfully, you'll need to manually create the UserCodeDraft table later."

# Follow the logs
docker-compose logs -f app 