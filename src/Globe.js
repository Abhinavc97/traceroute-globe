import React, { Component } from "react";
import axios from "axios";
import SlideUpPanel from "./SlideUpPanel";

class TracerouteGlobe extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hops: [],
      loading: false,
      error: null,
      domain: "",
      isValidDomain: true,                      // Domain validity flag
    };
    
    // Create container reference
    this.globeContainerRef = React.createRef();
    this.globe = null;
  }
  
  componentDidMount() {
    // Ensure we wait for the DOM to be fully rendered
    window.setTimeout(() => {
      this.initGlobe();
    }, 500);
  }
  
  componentWillUnmount() {
    // Clean up resources
    if (this.globe) {
      try {
        const renderer = this.globe.renderer && typeof this.globe.renderer === 'function' 
          ? this.globe.renderer() 
          : null;
          
        if (renderer && renderer.dispose) {
          renderer.dispose();
        }
      } catch (e) {
        console.warn("Could not fully clean up Globe instance:", e);
      }
    }
  }

  // Domain validation method
validateDomain = (domain) => {
  // Regular expression to match valid domain formats
  // Matches: example.com, www.example.com, sub.example.co.uk, etc.
  const domainRegex = /^(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
  return domainRegex.test(domain);
}

// Handle input changes in the search box
handleDomainChange = (e) => {
  const domain = e.target.value;
  this.setState({ 
    domain: domain,
    isValidDomain: domain === "" || this.validateDomain(domain)
  });
}

// Handle form submission
handleSubmit = (e) => {
  e.preventDefault();
  const { domain } = this.state;
  
  if (this.validateDomain(domain)) {
    // Reset state for new traceroute
    this.setState({ 
      loading: true, 
      error: null,
      hops: []
    });
    
    // Start fetching traceroute data
    this.fetchTracerouteData(domain);
  } else {
    this.setState({ 
      error: "Invalid domain format. Please enter a valid domain (e.g., example.com or www.example.com)",
      isValidDomain: false
    });
  }
}
  
  async initGlobe() {
    if (!this.globeContainerRef.current) {
      this.setState({ error: "Globe container not found" });
      return;
    }
    
    try {
      // Dynamically import the Globe.js library
      const GlobeModule = await import('globe.gl');
      const Globe = GlobeModule.default;
      
      // Create globe instance with enhanced configuration
      this.globe = Globe()
        (this.globeContainerRef.current)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-dark.jpg")
        .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png") // Optional: adds a starry background
        .backgroundColor("#000011")
        .atmosphereColor("rgba(127, 127, 255, 0.3)") // Optional: adds a subtle glow
        .pointOfView({ lat: 30, lng: 0, altitude: 2.5 });
      
      // Enable auto-rotation for a more dynamic view
      if (this.globe.controls) {
        this.globe.controls().autoRotate = true;
        this.globe.controls().autoRotateSpeed = 0.35;
      }
      
      // Fetch traceroute data
      //this.fetchTracerouteData(); don't uncomment
    } catch (err) {
      console.error("Failed to initialize globe:", err);
      this.setState({ error: `Globe initialization error: ${err.message}`, loading: false });
    }
  }
  
  async fetchTracerouteData(target = null) {
    try {
      this.setState({ loading: true, error: null });
      const domain = target || this.state.domain;
      
      try {
        //const response = await axios.get(`http://127.0.0.1:5000/traceroute/${domain}`);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
        const response = await axios.get(`${API_URL}/traceroute/${domain}`);
        
        // Check if the response data is empty or undefined
        if (!response.data || (Array.isArray(response.data) && response.data.length === 0)) {
          // This could indicate an unknown host error
          this.setState({ 
            error: `Unable to resolve domain "${domain}". Please check the domain name and try again.`,
            loading: false,
            hops: []
          });
          
          // Reset globe state
          this.resetGlobeState();
          
          return;
        }
        
        // Normal processing for successful traceroute data
        this.setState({ hops: response.data, loading: false }, () => {
          this.updateVisualization();
        });
      } catch (err) {
        // This catches network errors, 4xx, 5xx status codes, etc.
        this.handleTracerouteError(err, domain);
      }
    } catch (generalErr) {
      // Catch any unexpected errors in the outer try-catch
      console.error("Unexpected error in fetchTracerouteData:", generalErr);
      this.setState({ 
        error: "An unexpected error occurred. Please try again.",
        loading: false,
        hops: []
      });
      this.resetGlobeState();
    }
  }
  
  // Helper method to handle different types of errors
  handleTracerouteError(err, domain) {
    let errorMessage = "Failed to load traceroute data";
    
    if (err.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (err.response.status) {
        case 404:
          errorMessage = `Unable to resolve domain "${domain}". Please check the domain name and try again.`;
          break;
        case 500:
          errorMessage = "Internal server error. Please try again later.";
          break;
        default:
          errorMessage = `Server error (${err.response.status}): ${err.response.data || "Unknown error"}`;
      }
    } else if (err.request) {
      // The request was made but no response was received
      errorMessage = "No response from server. Please check your internet connection.";
    } else {
      // Something happened in setting up the request that triggered an Error
      errorMessage = err.message || "Unknown error occurred";
    }
    
    this.setState({ 
      error: errorMessage, 
      loading: false, 
      hops: [] 
    });
    
    // Reset globe state
    this.resetGlobeState();
  }
  
  // New method to reset globe state
  resetGlobeState() {
    // Re-enable auto-rotation
    if (this.globe && this.globe.controls) {
      this.globe.controls().autoRotate = true;
      this.globe.controls().autoRotateSpeed = 0.35;
    }
    
    // Clear any existing visualization
    if (this.globe) {
      this.globe.pointsData([]);
      this.globe.arcsData([]);
    }
  }

  focusCameraOnTraceroute(validHops) {
    if (!this.globe || validHops.length === 0) return;
    
    try {
      // Calculate the geographic center of the traceroute path
      let totalLat = 0;
      let totalLng = 0;
      
      validHops.forEach(hop => {
        totalLat += hop.latitude;
        totalLng += hop.longitude;
      });
      
      const centerLat = totalLat / validHops.length;
      const centerLng = totalLng / validHops.length;
      
      // Determine appropriate altitude based on distance between hops
      // We'll calculate the maximum distance between any two consecutive hops
      let maxDistance = 0;
      
      for (let i = 0; i < validHops.length - 1; i++) {
        const hop1 = validHops[i];
        const hop2 = validHops[i + 1];
        
        // Calculate great-circle distance (haversine formula)
        const lat1 = hop1.latitude * Math.PI / 180;
        const lat2 = hop2.latitude * Math.PI / 180;
        const lng1 = hop1.longitude * Math.PI / 180;
        const lng2 = hop2.longitude * Math.PI / 180;
        
        const dlat = lat2 - lat1;
        const dlng = lng2 - lng1;
        
        const a = Math.sin(dlat/2) * Math.sin(dlat/2) + 
                  Math.cos(lat1) * Math.cos(lat2) * 
                  Math.sin(dlng/2) * Math.sin(dlng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = 6371 * c; // Earth radius in km
        
        maxDistance = Math.max(maxDistance, distance);
      }
      
      // Translate distance to altitude (higher for longer distances)
      // These values can be adjusted based on testing
      let altitude;
      if (maxDistance > 10000) {
        altitude = 2.5; // Global route - view from far
      } else if (maxDistance > 5000) {
        altitude = 1.8; // Continental route
      } else if (maxDistance > 1000) {
        altitude = 1.3; // Regional route
      } else {
        altitude = 1.0; // Local route - closer view
      }
      
      // Animate to the new position over 1.5 seconds
      this.globe.pointOfView({
        lat: centerLat,
        lng: centerLng,
        altitude: altitude
      }, 1500); // Transition duration in milliseconds
    } catch (err) {
      console.error("Error focusing camera:", err);
    }
  }
  
  updateVisualization() {
    const { hops } = this.state;
    
    if (!this.globe || hops.length === 0) {
      console.warn("Cannot update visualization - globe not initialized or no data available");
      return;
    }
    
    try {
      // First, filter out only the hops with valid location data for points
      const validHops = hops.filter(hop => hop.latitude && hop.longitude);

      // Stop auto-rotation when we have data
    if (this.globe.controls && validHops.length > 0) {
      this.globe.controls().autoRotate = false;
    }
      
      // Create points data for each valid hop
      const pointsData = validHops.map((hop, idx) => {
        const isStart = idx === 0;
        const isEnd = idx === validHops.length - 1;
        
        return {
          lat: hop.latitude,
          lng: hop.longitude,
          // Make start and end points larger
          size: 0.25,//isStart || isEnd ? 0.35 : 0.1,
          // Use distinctive colors for start (green) and end (red), others remain white/blue
          color: isStart ? "rgba(0, 255, 0, 1.0)" ://green 
                 isEnd ? "rgba(255, 100, 100, 1.0)" : //red
                 hop.dotted ? "rgba(255, 255, 255, 0.8)" : "rgba(0, 100, 255, 1.0)",//blue
          label: isStart ? "START: " + (hop.city + "," + hop.region|| 'Unknown IP') :
                 isEnd ? "END: " + (hop.city + "," + hop.region|| 'Unknown IP') :
                 hop.city + "," + hop.region|| 'Unknown IP',
          // Store the original hop index to track position in sequence
          originalIndex: hops.indexOf(hop)
        };
      });
        
      if (pointsData.length > 0) {
        // Render the points on the globe
        this.globe
          .pointsData(pointsData)
          .pointAltitude(0.01)
          .pointColor('color')
          .pointRadius('size')
          .pointLabel('label')
          .pointsMerge(false);
      }
      
      // Create arcs data connecting known locations
      const arcsData = [];
      
      // Loop through the valid hops (those with location data)
      for (let i = 0; i < validHops.length - 1; i++) {
        const currentHop = validHops[i];
        const nextHop = validHops[i + 1];
        
        // Skip creating an arc if the coordinates are the same
        if (currentHop.latitude === nextHop.latitude && 
            currentHop.longitude === nextHop.longitude) {
          continue;
        }
        
        // Calculate the original indices in the full hops array
        const currentIndex = hops.indexOf(currentHop);
        const nextIndex = hops.indexOf(nextHop);
        
        // Check if there are unknown hops between these known points
        const hasUnknownHopsBetween = nextIndex - currentIndex > 1;
        
        arcsData.push({
          startLat: currentHop.latitude,
          startLng: currentHop.longitude,
          endLat: nextHop.latitude,
          endLng: nextHop.longitude,
          // If there are unknown hops between, use red color
          color: hasUnknownHopsBetween ? 
            "rgba(255, 50, 50, 0.8)" : // Red for connections with unknown hops in between
           // `rgba(${255 * (i / (Math.max(validHops.length - 2, 1)))}, 100, ${255 - 255 * (i / (Math.max(validHops.length - 2, 1)))}, 0.8)`,
            "rgba(255, 255, 255, 0.8)",
          dashAnimateTime: 1500,
          dashInitialGap: 1,
          // Make the line thicker for segments with unknown hops to emphasize them
          stroke: 0.75,//hasUnknownHopsBetween ? 1.3 : 1.0,
          // Store information for our animation logic
          isGapSegment: hasUnknownHopsBetween,
          originalStartIndex: currentIndex,
          originalEndIndex: nextIndex
        });
      }
      
      // Apply arc animations to the globe with modified settings
      this.globe
        .arcsData(arcsData)
        .arcColor('color')
        .arcStroke('stroke')
        .arcDashLength(0.2)
        .arcDashGap(0.1)
        .arcDashAnimateTime('dashAnimateTime')
        .arcDashInitialGap('dashInitialGap')
        .arcAltitude(0.1)
        .arcCurveResolution(64)
        .arcCircularResolution(64);

      // After visualization is updated, focus the camera on the traceroute path
      this.focusCameraOnTraceroute(validHops);  
      
      // Start the sequential animation cycle
      this.startAnimationCycle(arcsData);
      
    } catch (err) {
      console.error("Error updating visualization:", err);
      this.setState({ error: `Visualization error: ${err.message}` });
    }
  }
  


  startAnimationCycle(arcsData) {
    // Clear any existing animation timers
    if (this.animationTimers) {
      this.animationTimers.forEach(timer => clearTimeout(timer));
    }
    
    // Create a new array to store all animation timers
    this.animationTimers = [];
    
    const animateSequentially = (arcIndex = 0) => {
      // If we've finished animating all arcs, restart after a delay
      if (arcIndex >= arcsData.length) {
        const restartTimer = setTimeout(() => animateSequentially(0), 3000);
        this.animationTimers.push(restartTimer);
        return;
      }
      
      // Get the current arc to animate
      const currentArc = arcsData[arcIndex];
      
      // Create an array with ONLY the current arc
      const singleArcData = [{
        ...currentArc,
        dashInitialGap: 0, // Make it visible
        dashAnimateTime: currentArc.isGapSegment ? 2000 : 1500
      }];
      
      // Update the globe with ONLY this single arc
      this.globe.arcsData(singleArcData);
      
      // Calculate how long to wait before showing the next arc
      // We wait for the full animation time plus a small pause
      const animationDuration = currentArc.isGapSegment ? 2000 : 1500;
      const pauseDuration = 300; // Small pause between arcs
      
      // Schedule the next arc to appear after this one completes
      const nextTimer = setTimeout(() => {
        animateSequentially(arcIndex + 1);
      }, animationDuration + pauseDuration);
      
      this.animationTimers.push(nextTimer);
    };
    
    // Start with the first arc (index 0)
    animateSequentially(0);
  } 
  
  componentWillUnmount() {
    // Clean up all animation timers
    if (this.animationTimers) {
      this.animationTimers.forEach(timer => clearTimeout(timer));
    }
    
    // Clean up globe resources
    if (this.globe) {
      try {
        const renderer = this.globe.renderer && typeof this.globe.renderer === 'function' 
          ? this.globe.renderer() 
          : null;
          
        if (renderer && renderer.dispose) {
          renderer.dispose();
        }
      } catch (e) {
        console.warn("Could not fully clean up Globe instance:", e);
      }
    }
  }
  
  render() {
    const { loading, error, domain, isValidDomain } = this.state;
    
    return (
      <div className="traceroute-globe-container">
        {/* Search form at the top */}
        <div style={{
          position: "absolute",
          top: "10px",
          left: "0",
          right: "0",
          margin: "0 auto",
          width: "80%",
          maxWidth: "600px",
          padding: "15px",
          background: "rgba(0,0,0,0.7)",
          borderRadius: "8px",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }}>
          <form onSubmit={this.handleSubmit} style={{ width: "100%", display: "flex" }}>
            <input
              type="text"
              value={domain}
              onChange={this.handleDomainChange}
              placeholder="Enter domain (e.g., example.com)"
              style={{
                flex: 1,
                padding: "10px",
                borderRadius: "4px 0 0 4px",
                border: isValidDomain ? "1px solid #ccc" : "1px solid #ff4444",
                fontSize: "16px"
              }}
            />
            <button 
              type="submit" 
              disabled={!isValidDomain || loading}
              style={{
                padding: "10px 15px",
                backgroundColor: loading ? "#555555" : "#4285f4",
                color: "white",
                border: "none",
                borderRadius: "0 4px 4px 0",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "16px"
              }}
            >
              Trace
            </button>
          </form>
          
          {!isValidDomain && (
            <div style={{
              color: "#ff4444",
              padding: "5px",
              fontSize: "14px",
              width: "100%",
              textAlign: "left"
            }}>
              Please enter a valid domain name (e.g., example.com or www.example.com)
            </div>
          )}
        </div>
        
        {error && (
          <div style={{
            position: "absolute",
            top: "70px",
            left: "10px",
            padding: "10px",
            background: "rgba(255,0,0,0.7)",
            color: "white",
            zIndex: 1000,
            borderRadius: "4px",
            fontFamily: "Arial, sans-serif"
          }}>
            Error: {error}
          </div>
        )}
        
        {loading && (
      <div style={{
        position: "absolute",
        top: "80px",
        left: "0",
        right: "0",
        margin: "0 auto",
        width: "80%",
        maxWidth: "600px",
        padding: "15px",
        background: "rgba(0,0,0,0.7)",
        color: "white",
        zIndex: 1000,
        borderRadius: "8px",
        fontFamily: "Arial, sans-serif",
        textAlign: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ 
            width: "20px", 
            height: "20px", 
            borderRadius: "50%", 
            border: "2px solid #ccc",
            borderTopColor: "#fff",
            animation: "spin 1s linear infinite",
            marginRight: "10px"
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <span>Resolving {this.state.domain} and tracing route...</span>
        </div>
      </div>
    )}
         <SlideUpPanel />
        <div 
          ref={this.globeContainerRef} 
          style={{ 
            width: "100vw", 
            height: "100vh",
            background: "#000011" 
          }}
        />

       
      </div>
    );
  }

}

export default TracerouteGlobe;