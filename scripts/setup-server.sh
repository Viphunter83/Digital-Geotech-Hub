#!/bin/bash

# Configuration
PROJECT_DIR="/var/www/digital-geotech-hub"
REPO_URL="https://github.com/Viphunter83/Digital-Geotech-Hub.git"

echo "🚀 Starting server setup for Digital Geotech Hub..."

# 1. Update system and install dependencies
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-v2

# 2. Create project directory
sudo mkdir -p /var/www
sudo chown $USER:$USER /var/www

if [ ! -d "$PROJECT_DIR" ]; then
    echo "📂 Cloning repository..."
    git clone $REPO_URL $PROJECT_DIR
else
    echo "✅ Project directory already exists."
fi

cd $PROJECT_DIR

# 3. Prepare .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating initial .env file. Please fill in the secrets later!"
    cp .env.example .env 2>/dev/null || touch .env
fi

echo "✅ Server setup complete!"
echo "👉 Next steps:"
echo "1. Put your production secrets in $PROJECT_DIR/.env"
echo "2. Add SERVER_HOST, SERVER_USER, and SSH_PRIVATE_KEY to GitHub Secrets."
