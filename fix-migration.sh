#!/bin/bash

# Start PostgreSQL in the background
docker-compose up -d db

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
sleep 10

# Connect to PostgreSQL and insert the new migration record
docker-compose exec -T db psql -U nexacademy -d nexacademy -c "
INSERT INTO \"_prisma_migrations\" (\"id\", \"checksum\", \"finished_at\", \"migration_name\", \"logs\", \"rolled_back_at\", \"started_at\", \"applied_steps_count\")
VALUES 
  ('manual-fix-$(date +%s)', 'manual', NOW(), '20250430999999_create_user_code_draft', 'Manually applied', NULL, NOW(), 1)
ON CONFLICT DO NOTHING;
"

# Show message
echo "Migration record inserted. Now starting the rest of the services..."

# Start the rest of the services
docker-compose up -d 