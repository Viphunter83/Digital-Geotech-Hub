#!/bin/bash
DIRECTUS_URL="https://terra-expert.ru/directus"
# Read credentials from .env
ADMIN_EMAIL=$(grep ADMIN_EMAIL /var/www/digital-geotech-hub/.env | cut -d= -f2 | xargs)
ADMIN_PASSWORD=$(grep ADMIN_PASSWORD /var/www/digital-geotech-hub/.env | cut -d= -f2 | xargs)

echo "Logging in as $ADMIN_EMAIL..."

# Get access token
RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$ADMIN_EMAIL\", \"password\": \"$ADMIN_PASSWORD\"}")

TOKEN=$(echo $RESPONSE | sed 's/.*"access_token":"\([^"]*\)".*/\1/')

if [[ "$TOKEN" == *"{"* ]] || [ -z "$TOKEN" ]; then
  echo "Login failed: $RESPONSE"
  exit 1
fi

echo "Login successful."

# Define fields to add
FIELDS=("rate_piling" "rate_vibration" "rate_drilling" "rate_extraction" "rate_excavation")
LABELS=("Погружение (руб/т)" "Вдавливание (руб/т)" "Бурение (руб/м)" "Извлечение (руб/т)" "Выемка (руб/м3)")

for i in "${!FIELDS[@]}"; do
    FIELD=${FIELDS[$i]}
    LABEL=${LABELS[$i]}
    echo "Adding field: $FIELD ($LABEL)..."
    
    curl -s -X POST "${DIRECTUS_URL}/fields/site_settings" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{
        \"field\": \"$FIELD\",
        \"type\": \"float\",
        \"meta\": {
          \"interface\": \"input-number\",
          \"display\": \"formatted-value\",
          \"options\": {
            \"suffix\": \" руб\"
          }
        }
      }"
    echo ""
done

echo "Done."
