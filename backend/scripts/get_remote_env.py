import os

host = os.getenv("PROD_SERVER_IP", "155.212.209.113")
user = "root"
password = os.getenv("PROD_SSH_PASS")

def get_env():
    try:
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(host, username=user, password=password)
        
        stdin, stdout, stderr = ssh.exec_command("cat /var/www/digital-geotech-hub/.env")
        content = stdout.read().decode()
        error = stderr.read().decode()
        
        if error:
            print(f"Error: {error}")
        else:
            print(content)
            
        ssh.close()
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    get_env()
