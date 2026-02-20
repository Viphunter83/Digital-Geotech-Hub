#!/bin/bash
DIRECTUS_URL="https://terra-expert.ru/directus"
TOKEN="admin-token-123"

# 1. Add production_image to company_info
echo "Adding production_image to company_info..."
curl -s -X POST "${DIRECTUS_URL}/fields/company_info" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "production_image",
    "type": "uuid",
    "meta": {
      "interface": "file-image",
      "display": "image",
      "note": "Фоновое фото производства",
      "width": "full"
    },
    "schema": { "is_nullable": true, "foreign_key_table": "directus_files", "foreign_key_column": "id" }
  }'
echo ""

# 2. Add hero_image to about_page
echo "Adding hero_image to about_page..."
curl -s -X POST "${DIRECTUS_URL}/fields/about_page" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "field": "hero_image",
    "type": "uuid",
    "meta": {
      "interface": "file-image",
      "display": "image",
      "note": "Главное фото раздела О компании",
      "width": "full"
    },
    "schema": { "is_nullable": true, "foreign_key_table": "directus_files", "foreign_key_column": "id" }
  }'
echo ""

echo "Done."
