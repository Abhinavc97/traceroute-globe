from flask import Flask, jsonify
from flask_cors import CORS
import subprocess
import re
import os
from ip_lookup import get_geo_location  # Your existing function

app = Flask(__name__)
# Enable CORS with more specific configuration for production
CORS(app, resources={r"/*": {"origins": "*"}})

def run_traceroute(destination):
    # Check if we're on Linux (like most cloud providers) or another OS
    if os.name == 'posix':  # Linux/Unix
        cmd = ['traceroute', '-n', '-q', '1', '-m', '20', destination]
    else:  # Windows
        cmd = ['tracert', '-d', '-h', '20', destination]
        
    result = subprocess.run(cmd, capture_output=True, text=True)
    output = result.stdout.splitlines()
    hops = []

    prev_geo = None  # Store last known geo-location for dotted line interpolation

    for line in output:
        if not line.strip():
            continue
            
        parts = line.split()
        if not parts:
            continue

        # Try to extract hop number - different formats in different OS
        try:
            hop_num = int(parts[0])  # First value is hop number in Linux
        except ValueError:
            # Windows format might be different, try to find a number
            for part in parts:
                if part.isdigit():
                    hop_num = int(part)
                    break
            else:
                continue  # Skip this line if no hop number found
        
        ip_pattern = re.compile(r"(\d+\.\d+\.\d+\.\d+)")  # Find IP
        match = ip_pattern.search(line)
        ip = match.group(1) if match else None

        if "*" in parts or not ip:  # Unresolved hop
            hops.append({
                "hop": hop_num,
                "ip": None,
                "latitude": None,
                "longitude": None,
                "city": None,
                "region": None,
                "dotted": True  # Mark as a dotted line
            })
        else:
            geo_info = get_geo_location(ip) if ip else {"latitude": None, "longitude": None, "city": None, "region": None}
            if geo_info:
                hops.append({
                    "hop": hop_num,
                    "ip": ip,
                    "latitude": geo_info.get("latitude"),
                    "longitude": geo_info.get("longitude"),
                    "city": geo_info.get("city"),
                    "region": geo_info.get("region"),
                    "dotted": False
                })
                prev_geo = geo_info  # Update last known location

    return hops

@app.route('/traceroute/<destination>')
def traceroute_api(destination):
    hops = run_traceroute(destination)
    return jsonify(hops)

# Add a simple health check endpoint
@app.route('/')
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 8080))
    app.run(host='0.0.0.0', port=port)