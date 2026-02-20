#!/bin/bash
DIRECTUS_URL="https://terra-expert.ru/directus"
TOKEN="admin-token-123"

echo "Using found token to update schema..."

# Define fields to add
FIELDS=("rate_piling" "rate_vibration" "rate_drilling" "rate_extraction" "rate_excavation")
LABELS=("Погружение (руб/т)" "Вдавливание (руб/т)" "Бурение (руб/м)" "Извлечение (руб/т)" "Выемка (руб/м3)")

for i in "${!FIELDS[@]}"; do
    FIELD=${FIELDS[$i]}
    LABEL=${LABELS[$i]}
    echo "Adding field: $FIELD ($LABEL)..."
    
    RESPONSE=$(curl -s -X POST "${DIRECTUS_URL}/fields/site_settings" \
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
      }")
    
    if [[ "$RESPONSE" == *"errors"* ]]; then
        echo "Failed or already exists: $RESPONSE"
    else
        echo "✅ Success"
    fi
    echo ""
done

echo "Done."
