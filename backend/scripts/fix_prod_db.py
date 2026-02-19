import subprocess

def run_remote_sql(sql):
    cmd = [
        "sshpass", "-p", "PeRpWu52*f%X", 
        "ssh", "-o", "StrictHostKeyChecking=no", "root@155.212.209.113",
        f"docker exec geotech_db psql -U directus -d directus -c \"{sql}\""
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error: {result.stderr}")
    else:
        print(result.stdout)

# 1. Add satisfaction columns to production
print("Adding columns to production database...")
run_remote_sql("ALTER TABLE projects ADD COLUMN IF NOT EXISTS machinery_used integer; ALTER TABLE services ADD COLUMN IF NOT EXISTS features integer;")

# 2. Get Public Policy ID
print("Finding Public Policy ID...")
# We already found abf8a154-5b1c-4a46-ac9c-7300570f4f17

# 3. Set Permissions
print("Setting Public Permissions...")
collections = [
    'articles', 'article_categories', 'machinery', 'machinery_categories', 
    'services', 'service_features', 'faq', 'hero_configs', 'hero_badges', 
    'advantages', 'company_stats', 'company_values', 'company_info', 
    'projects', 'geology_points', 'about_page', 'site_settings'
]

for coll in collections:
    sql = f"INSERT INTO directus_permissions (collection, action, fields, policy) VALUES ('{coll}', 'read', '*', 'abf8a154-5b1c-4a46-ac9c-7300570f4f17') ON CONFLICT DO NOTHING;"
    run_remote_sql(sql)

print("Done.")
