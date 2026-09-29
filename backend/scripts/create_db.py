import os
import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

load_dotenv()

POSTGRES_SERVER = os.getenv("POSTGRES_SERVER", "localhost")
POSTGRES_PORT = int(os.getenv("POSTGRES_PORT", "5432"))
POSTGRES_USER = os.getenv("POSTGRES_USER", "postgres")
POSTGRES_PASSWORD = os.getenv("POSTGRES_PASSWORD", "vrushali")
TARGET_DB = os.getenv("POSTGRES_DB", "ecommerce_db")


def create_database():
    """Connect to postgres server and create the target database if not present."""
    print(f"Connecting to PostgreSQL at {POSTGRES_SERVER}:{POSTGRES_PORT} as '{POSTGRES_USER}'...")
    try:
        conn = psycopg2.connect(
            host=POSTGRES_SERVER,
            port=POSTGRES_PORT,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            dbname="postgres",
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        cursor.execute(f"SELECT 1 FROM pg_catalog.pg_database WHERE datname = '{TARGET_DB}'")
        exists = cursor.fetchone()

        if not exists:
            print(f"Creating database '{TARGET_DB}'...")
            cursor.execute(f"CREATE DATABASE {TARGET_DB};")
            print(f"Database '{TARGET_DB}' created successfully!")
        else:
            print(f"Database '{TARGET_DB}' already exists.")

        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"Error creating database: {e}", file=sys.stderr)
        return False


if __name__ == "__main__":
    success = create_database()
    if not success:
        sys.exit(1)
