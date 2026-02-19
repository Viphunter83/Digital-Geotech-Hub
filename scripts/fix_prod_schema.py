import sys
import subprocess
import json

SSH_CMD = "sshpass -p 'PeRpWu52*f%X' ssh -o StrictHostKeyChecking=no root@155.212.209.113"

def run_psql(query):
    command = f"{SSH_CMD} \"docker exec geotech_db psql -U directus -d directus -c \\\"{query}\\\"\""
    result = subprocess.run(command, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error executing query: {result.stderr}")
    return result.stdout

def fix_schema():
    print("Fixing Production Schema...")
    
    # hero_configs
    print("Updating hero_configs...")
    run_psql("ALTER TABLE hero_configs ADD COLUMN IF NOT EXISTS region CHARACTER VARYING(255);")
    run_psql("UPDATE hero_configs SET region = id WHERE region IS NULL;")
    
    # services
    print("Updating services...")
    run_psql("ALTER TABLE services ADD COLUMN IF NOT EXISTS icon_name CHARACTER VARYING(255);")
    run_psql("ALTER TABLE services ADD COLUMN IF NOT EXISTS tag_msk CHARACTER VARYING(255);")
    run_psql("ALTER TABLE services ADD COLUMN IF NOT EXISTS tag_spb CHARACTER VARYING(255);")
    run_psql("ALTER TABLE services ADD COLUMN IF NOT EXISTS stats_label CHARACTER VARYING(255);")
    
    # Seed services data
    run_psql("UPDATE services SET icon_name = 'Ruler' WHERE slug = 'bored-piles';")
    run_psql("UPDATE services SET icon_name = 'Hammer' WHERE slug = 'sheet-piling';")
    run_psql("UPDATE services SET icon_name = 'Truck' WHERE slug = 'machinery';")
    run_psql("UPDATE services SET icon_name = 'ShieldCheck' WHERE slug = 'pile-driving';")
    
    # projects
    print("Updating projects...")
    run_psql("ALTER TABLE projects ADD COLUMN IF NOT EXISTS year INTEGER;")
    run_psql("ALTER TABLE projects ADD COLUMN IF NOT EXISTS region CHARACTER VARYING(255);")
    run_psql("ALTER TABLE projects ADD COLUMN IF NOT EXISTS challenge TEXT;")
    run_psql("ALTER TABLE projects ADD COLUMN IF NOT EXISTS solution TEXT;")
    run_psql("ALTER TABLE projects ADD COLUMN IF NOT EXISTS stats JSONB;")
    run_psql("ALTER TABLE projects ADD COLUMN IF NOT EXISTS technologies JSONB;")
    
    print("Schema fix complete.")

if __name__ == "__main__":
    fix_schema()
