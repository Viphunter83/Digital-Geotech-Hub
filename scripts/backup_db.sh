#!/bin/bash

# Configuration
BACKUP_DIR="/var/www/digital-geotech-hub/backups"
DB_CONTAINER="geotech_db"
DB_USER="directus"
DB_NAME="directus"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$DATE.sql"

echo "🚀 Starting database backup..."

# 1. Create backup directory if not exists
mkdir -p $BACKUP_DIR

# 2. Perform pg_dump
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Backup successful: $BACKUP_FILE"
    # Gzip the file to save space
    gzip $BACKUP_FILE
    echo "📦 Compressed: $BACKUP_FILE.gz"
else
    echo "❌ Backup failed!"
    exit 1
fi

# 3. Cleanup: Remove backups older than 7 days
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
echo "🧹 Old backups cleaned up."

echo "🏁 Backup process complete."
