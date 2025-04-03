# Traceroute 3D Visualization

## Overview
Traceroute 3D Visualization is a web-based tool that visually represents the path network packets take across the globe. This project provides an interactive 3D globe where traceroute hops are animated as arcs, making it easier to understand network traversal. The visualization helps users see how their data moves through the internet, highlighting direct and indirect hops, unknown nodes, and route loops.

## Features
- **3D Globe Visualization**: Uses ThreeJS/WebGL-based UI component for globe data visualization to display network traversal.
- **Animated Path Traversal**: Arcs animate in succession as data moves from hop to hop. The animation loops once traversal is completed.
- **Hop Indicators**:
  - The traversal starts from a **green dot** marking the origin.
  - The traversal ends at a **red dot** marking the destination.
  - **Red arcs** represent indirect hops where intermediate nodes are unknown.
- **List View of Hops**:
  - Clicking the "Show Hops" toggle slides in a list displaying all hops in sequence.
  - The same indicators (green for start, red for end, red arcs for indirect hops) apply to the list.
- **Optimized Animation**:
  - If multiple IP addresses resolve to the same physical location (latitude & longitude), arcs between them are skipped to keep the visualization clean.
- **Search and Input Validation**:
  - The search bar at the top validates input format.
  - Handles errors for incorrect or non-existent domain names.
- **Deployment Options**:
  - Hosted as a web app for an instant demonstration.
  - Users can run it locally to trace routes from their own machines by adjusting environment variables.

## Origin Point Information
When using Traceroute Visualizer, the originating system is hosted in an AWS data center in Columbus, Ohio. This means all traffic first travels through AWS's backbone infrastructure before reaching the public internet. AWS often employs private or internal routing mechanisms, which can cause initial hops to appear different from what you'd see on a standard traceroute. However, this setup allows you to test connectivity from our system to any destination worldwide, providing an independent perspective on network performance beyond your current location.

## Network Path Visualization
Visualizing network paths through traceroute provides valuable insights into the geographic journey of an internet connection. Our online traceroute tool processes raw traceroute output, extracts relevant data, and plots the results on an interactive world map. Starting from our server on the East Coast of the USA, this test displays each reachable hop along the route. However, geolocation accuracy can vary, and occasional discrepancies may occur in the mapped results.

## Installation & Setup
To run the project locally:
1. Clone the repository:
   ```sh
   git clone https://github.com/Abhinavc97/traceroute-globe.git
   cd traceroute-globe
   ```
2. Install dependencies:
   ```sh
   pip3 install backend/requirements.txt
   ```
   ```sh
   npm install
   ```
3. Set up environment variables:
   - Update `.env` with the required API keys and local configurations.
4. Start the server:
   ```sh
   python3 backend/app.py
   ```
5. Start the react app:
   ```sh
   npm start
   ```

## Usage
- Enter a domain name in the search bar.
- Watch the animation of hops appearing on the 3D globe.
- Toggle the "Show Hops" button to see the list view.

## Technologies Used
- **Frontend**: React, Three.js, WebGL
- **Backend**: Python, Flask
- **Data Processing**: GeoIP lookup, Traceroute analysis
- **Geolocation Database**: IP2LOCATION-LITE DB11 converted to SQLite3

## Geolocation Database
The application uses IP2LOCATION-LITE DB11 for resolving IP addresses to geographical coordinates (latitude and longitude) and obtaining region and city information. The database workflow:
1. The database is downloaded from ip2location.com as a CSV file
2. The CSV is converted to SQLite3 format for significantly faster lookups
3. This optimization improves the speed and performance of geolocation queries during traceroute analysis

The SQLite3 database provides an efficient method for retrieving geographical data without relying on external API calls for each IP lookup.

## Future Improvements
- Enhancing visual customization options for user preferences.
- Expanding the geolocation database with more detailed network infrastructure information.

## Demo
A hosted version of the application is available [here](https://traceroute-globe.vercel.app/).