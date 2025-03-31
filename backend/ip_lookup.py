import sqlite3
import ipaddress
import os

db_path = os.path.join(os.path.dirname(__file__), "ip_database.db")

#DB_NAME = "backend/ip_database.db"

def ip_to_int(ip):
    return int(ipaddress.IPv4Address(ip))

def get_geo_location(ip):
    ip_int = ip_to_int(ip)
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Query for the IP range
    cursor.execute("""
        SELECT  region, city, latitude, longitude 
        FROM ip_data 
        WHERE start_ip <= ? AND end_ip >= ?
        LIMIT 1;
    """, (ip_int, ip_int))

    result = cursor.fetchone()
    conn.close()

    if result:
        region, city, latitude, longitude = result
        return {
            "region": region,
            "city": city,
            "latitude": latitude,
            "longitude": longitude
        }
    
    return {
            "region": "Unknown",
            "city": "Unknown",
            "latitude": 0,
            "longitude": 0
        }

# Example Usage:
#print(get_geo_location("8.8.8.8"))