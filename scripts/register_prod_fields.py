import os

# Use environment variables for connection to avoid hardcoding secrets
PROD_IP = os.getenv("PROD_SERVER_IP", "155.212.209.113")
# Use SSH keys instead of passwords. If password is needed, provide it via PROD_SSH_PASS env var.
SSH_PASS = os.getenv("PROD_SSH_PASS")
SSH_BASE = f"ssh -o StrictHostKeyChecking=no root@{PROD_IP}"
SSH_CMD = f"sshpass -p '{SSH_PASS}' {SSH_BASE}" if SSH_PASS else SSH_BASE

def run_psql(query):
    # Escape single quotes and double quotes for the shell command
    escaped_query = query.replace("'", "''")
    command = f"{SSH_CMD} \"docker exec geotech_db psql -U directus -d directus -c \\\"{query}\\\"\""
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error executing query: {result.stderr}")
    return result.stdout

def register_fields():
    print("Registering missing fields in directus_fields...")
    
    # Check if they already exist to avoid duplicates
    # services
    fields_services = ['icon_name', 'tag_msk', 'tag_spb', 'stats_label']
    for f in fields_services:
        run_psql(f"INSERT INTO directus_fields (collection, field, interface, hidden, readonly, required, width) SELECT 'services', '{f}', 'input', false, false, false, 'full' WHERE NOT EXISTS (SELECT 1 FROM directus_fields WHERE collection = 'services' AND field = '{f}');")

    # hero_configs
    run_psql("INSERT INTO directus_fields (collection, field, interface, hidden, readonly, required, width) SELECT 'hero_configs', 'region', 'input', false, false, false, 'full' WHERE NOT EXISTS (SELECT 1 FROM directus_fields WHERE collection = 'hero_configs' AND field = 'region');")

    # projects
    fields_projects = ['year', 'region', 'challenge', 'solution', 'stats', 'technologies']
    for f in fields_projects:
        run_psql(f"INSERT INTO directus_fields (collection, field, interface, hidden, readonly, required, width) SELECT 'projects', '{f}', 'input', false, false, false, 'full' WHERE NOT EXISTS (SELECT 1 FROM directus_fields WHERE collection = 'projects' AND field = '{f}');")

    print("Field registration complete.")

if __name__ == "__main__":
    register_fields()
