import csv
import ipaddress
import os

def load_ip_ranges(csv_file):
    ip_ranges = []
    current_dir = os.path.dirname(os.path.abspath(__file__))  # Get the directory of the current file
    file_path = os.path.join(current_dir, csv_file)  # Build the absolute file path

    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            for row in reader:
                try:
                    ip_ranges.append({
                        "start_ip": int(row[0]),
                        "end_ip": int(row[1]),
                        "country_code": row[2],
                        "country": row[3],
                        "region": row[4],
                        "city": row[5],
                        "latitude": float(row[6]),
                        "longitude": float(row[7])
                    })
                except (IndexError, ValueError) as e:
                    print(f"Error processing row: {row}. Error: {e}")
                    continue
    except FileNotFoundError:
        print(f"Warning: IP database file not found at {file_path}")
        # Return a minimal working dataset with one entry
        return [{
            "start_ip": 0,
            "end_ip": 4294967295,  # Max IP address in integer form
            "country_code": "US",
            "country": "United States",
            "region": "California",
            "city": "San Francisco",
            "latitude": 37.7749,
            "longitude": -122.4194
        }]
    
    return ip_ranges

# Load the IP database
try:
    ip_lookup = load_ip_ranges("IP2LOCATION-LITE-DB11.csv")
except Exception as e:
    print(f"Error loading IP database: {e}")
    ip_lookup = []

def get_geo_location(ip):
    if not ip_lookup:
        # Return default values if database couldn't be loaded
        return {
            "latitude": 0,
            "longitude": 0,
            "city": "Unknown",
            "region": "Unknown"
        }
        
    try:
        ip_int = int(ipaddress.IPv4Address(ip))
        for entry in ip_lookup:
            if entry["start_ip"] <= ip_int <= entry["end_ip"]:
                return entry
    except Exception as e:
        print(f"Error looking up IP {ip}: {e}")
    
    # Return default values if IP not found
    return {
        "latitude": 0,
        "longitude": 0,
        "city": "Unknown",
        "region": "Unknown"
    }