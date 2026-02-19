import os

# Production Database Connection should be provided via environment variable
PROD_DB_CONFIG = os.getenv("PROD_DB_URL") 
# Example: postgres://user:pass@host:5432/dbname

def get_local_permissions():
    import subprocess
    cmd = ["docker", "exec", "geotech_db", "psql", "-U", "directus", "-d", "directus", "-t", "-c", 
           "SELECT collection, action, permissions, fields FROM directus_permissions WHERE policy = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'"]
    output = subprocess.check_output(cmd).decode('utf-8')
    perms = []
    for line in output.strip().split('\n'):
        if not line.strip(): continue
        parts = [p.strip() for p in line.split('|')]
        if len(parts) == 4:
            perms.append(parts)
    return perms

def generate_prod_sql(perms):
    sql_lines = []
    policy_id = 'abf8a154-5b1c-4a46-ac9c-7300570f4f17'
    
    # First, clear existing permissions for this policy on production to avoid duplicates
    sql_lines.append(f"DELETE FROM directus_permissions WHERE policy = '{policy_id}';")
    
    for coll, action, perm, fields in perms:
        perm_val = perm if perm else '{}'
        fields_val = fields if fields else '*'
        sql_lines.append(
            f"INSERT INTO directus_permissions (policy, collection, action, permissions, fields) "
            f"VALUES ('{policy_id}', '{coll}', '{action}', '{perm_val}', '{fields_val}');"
        )
    return "\n".join(sql_lines)

if __name__ == "__main__":
    perms = get_local_permissions()
    print(f"Found {len(perms)} local permissions.")
    sql = generate_prod_sql(perms)
    with open("scripts/sync_permissions.sql", "w") as f:
        f.write(sql)
    print("Generated scripts/sync_permissions.sql")
