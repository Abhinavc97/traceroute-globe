import sqlite3
import csv

DB_NAME = "ip_database.db"
CSV_FILE = "IP2LOCATION-LITE-DB11.csv"

# Connect to SQLite database
conn = sqlite3.connect(DB_NAME)
cursor = conn.cursor()

# Create table
cursor.execute("""
CREATE TABLE IF NOT EXISTS ip_data (
    start_ip INTEGER PRIMARY KEY,
    end_ip INTEGER,
    country TEXT,
    region TEXT,
    city TEXT,
    latitude REAL,
    longitude REAL
);
""")

# Read CSV and insert data
with open(CSV_FILE, newline='', encoding='utf-8') as csvfile:
    reader = csv.reader(csvfile)
    for row in reader:
        start_ip = int(row[0])
        end_ip = int(row[1])
        country = row[3]
        region = row[4]
        city = row[5]
        latitude = float(row[6])
        longitude = float(row[7])

        cursor.execute("INSERT INTO ip_data VALUES (?, ?, ?, ?, ?, ?, ?)", 
                       (start_ip, end_ip, country, region, city, latitude, longitude))

# Commit and close
conn.commit()
conn.close()

print("Database created successfully!")