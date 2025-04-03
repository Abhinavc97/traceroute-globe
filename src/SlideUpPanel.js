import React, { useState, useEffect } from 'react';

const SlideUpPanel = () => {
  const [panelExpanded, setPanelExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('about');
  
  // Panel will auto-collapse when clicking outside of it (except for the toggle handle)
  useEffect(() => {
    const handleClickOutside = (event) => {
      const panel = document.getElementById('slide-up-panel');
      const handle = document.getElementById('panel-handle');
      
      if (panelExpanded && 
          panel && 
          !panel.contains(event.target) && 
          handle && 
          !handle.contains(event.target)) {
        setPanelExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [panelExpanded]);
  
  // Content for each tab
  const contentMap = {
    about: (
      <div>
        <h3 style={{ marginTop: 0, color: '#4285f4' }}>About Traceroute Visualizer</h3>
        <p>
          Traceroute Visualizer is an interactive web-based tool that transforms complex network
        data into a visually stunning 3D experience. Built using React, Three.js, and WebGL technology, this application renders a 
        detailed representation of how data packets travel across the internet as they move from our server to any destination worldwide.
        </p>
        <p>
        Originating from an AWS data center in Columbus, Ohio, our traceroute visualization provides a unique perspective on global network 
        connectivity. The application traces the path of data packets through multiple network hops, displaying each connection as an animated 
        arc on an interactive globe. This visualization makes it easy to understand network topology, identify potential bottlenecks, and observe 
        how your data traverses continents.
        </p>
        <p>
        The tool processes raw traceroute data through a Python/Flask backend, which leverages the IP2LOCATION database
         to accurately map IP addresses to geographical coordinates. The result is a comprehensive, real-time view of 
         internet infrastructure that transforms technical network data into an accessible, engaging visual experience.
        </p>
      </div>
    ),
    whatis: (
        <div>
        <h3 style={{ marginTop: 0, color: '#4285f4' }}>What is Traceroute?</h3>
        <p>
        Traceroute is a network diagnostic tool that maps the journey of data packets across the internet from source to destination.
        Unlike packet capture tools that analyze data content, traceroute focuses specifically on identifying the path data travels 
        through the internet infrastructure. When you connect to a website or online service, your data traverses multiple devices and
        networks—primarily routers—before reaching its destination.
        </p>
        <p>
        The traceroute command works by sending Internet Control Message Protocol (ICMP) packets to each router along the transmission path.
         These packets are designed with incrementing Time To Live (TTL) values, forcing each router in the chain to respond with 
         a time-exceeded message. This clever technique reveals each hop in the journey and measures the round-trip time to each intermediate point.  
        </p>
        </div>
    ),
    mapping: (
      <div>
        <h3 style={{ marginTop: 0, color: '#4285f4' }}>Path Visualization</h3>
        <p>
        The path visualization displayed on our 3D globe represents the actual route your data takes when traveling from 
        our server to your requested destination. Each arc on the globe corresponds to a "hop" between network nodes, 
        with a green marker indicating the origin point and a red marker showing the final destination.
        </p>
        <p>
        As you observe the visualization, you'll notice data packets first travel through AWS's backbone infrastructure before reaching 
        the public internet. This internal routing may cause initial hops to appear different from standard traceroute results you might 
        run locally. Red arcs indicate indirect hops where intermediate nodes couldn't be identified or precise location data wasn't available.
        </p>
        <p>
        The animated sequence shows how data moves sequentially from one point to another, giving you insight into the geographic journey of your 
        internet connection. For clarity, our visualization optimizes the display by skipping redundant arcs when multiple IP addresses resolve 
        to the same physical location.
        </p>
        <p>
        While we strive for accuracy, geolocation data can sometimes contain discrepancies due to the complex nature of IP address allocation and 
        the dynamic routing of internet traffic. The visualization provides a general representation of network paths rather than an exact
         geographical mapping. Toggle the "Show Hops" feature to see a detailed list view of each step in the network journey alongside the 
         visual representation.  
        </p>
      </div>
    ),
    legend: (
      <div style={{ textAlign: "center" }}>
        <h3 style={{ marginTop: 0, color: '#4285f4', fontSize: "20px", marginBottom: "15px" }}>Traceroute Legend</h3>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around" }}>
          {/* Points legend */}
          <div style={{ margin: "10px 15px", flex: 1, minWidth: "200px" }}>
            <div style={{ fontSize: "16px", marginBottom: "15px", textDecoration: "underline", fontWeight: "bold" }}>Points</div>
            <div style={{ display: "flex", alignItems: "center", margin: "15px 0", justifyContent: "center" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(0, 255, 0, 1.0)", marginRight: "15px" }}></div>
              <span style={{ fontSize: "16px" }}>Starting Point</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", margin: "15px 0", justifyContent: "center" }}>
              <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(255, 100, 100, 1.0)", marginRight: "15px" }}></div>
              <span style={{ fontSize: "16px" }}>Ending Point</span>
            </div>
          </div>
        
          {/* Lines legend */}
          <div style={{ margin: "10px 15px", flex: 1, minWidth: "200px" }}>
            <div style={{ fontSize: "16px", marginBottom: "15px", textDecoration: "underline", fontWeight: "bold" }}>Connections</div>
            <div style={{ display: "flex", alignItems: "center", margin: "15px 0", justifyContent: "center" }}>
              <div style={{ width: "40px", height: "4px", background: "rgba(255, 255, 255, 0.8)", marginRight: "15px" }}></div>
              <span style={{ fontSize: "16px" }}>Direct Connection</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", margin: "15px 0", justifyContent: "center" }}>
              <div style={{ width: "40px", height: "4px", background: "rgba(255, 50, 50, 0.8)", marginRight: "15px" }}></div>
              <span style={{ fontSize: "16px" }}>Indirect Connection (Missing Hops)</span>
            </div>
            
          </div>
        </div>
      </div>
    )
  };
  
  return (
    <>
      {/* Panel handle (always visible) */}
      <div 
        id="panel-handle"
        style={{
          position: "absolute",
          bottom: panelExpanded ? "280px" : "0",
          left: "50%",
          transform: "translateX(-50%)",
          padding: "8px 20px",
          background: "rgba(0,0,0,0.8)",
          color: "white",
          borderRadius: "8px 8px 0 0",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          transition: "bottom 0.3s ease",
          zIndex: 1001,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.5)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderBottom: "none"
        }}
        onClick={() => setPanelExpanded(!panelExpanded)}
      >
        <div style={{ transform: panelExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>⌃</div>
        <div>About Traceroute Visualization</div>
      </div>
      
      {/* Main panel */}
      <div 
        id="slide-up-panel"
        style={{
          position: "absolute",
          bottom: panelExpanded ? "0" : "-280px",
          left: "0",
          right: "0",
          height: "280px",
          background: "rgba(0,0,0,0.85)",
          transition: "bottom 0.3s ease",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* Tab navigation */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(20,20,20,0.5)",
          justifyContent: "space-between"
        }}>
          <TabButton 
            label="About" 
            isActive={activeTab === 'about'} 
            onClick={() => setActiveTab('about')}
          />
           <TabButton 
            label="What is Traceroute?" 
            isActive={activeTab === 'whatis'} 
            onClick={() => setActiveTab('whatis')}
          />
          <TabButton 
            label="Mapping" 
            isActive={activeTab === 'mapping'} 
            onClick={() => setActiveTab('mapping')}
          />
          <TabButton 
            label="Legend" 
            isActive={activeTab === 'legend'} 
            onClick={() => setActiveTab('legend')}
          />
        </div>
        
        {/* Content area */}
        <div style={{
          padding: "20px",
          overflowY: "auto",
          height: "100%",
          color: "white",
          fontFamily: "Arial, sans-serif",
          fontSize: "14px",
          lineHeight: "1.6"
        }}>
          {contentMap[activeTab]}
        </div>
      </div>
    </>
  );
};

// Tab button component - modified to stretch full width
const TabButton = ({ label, isActive, onClick }) => (
  <div 
    style={{
      padding: "12px 20px",
      cursor: "pointer",
      borderBottom: isActive ? "2px solid #4285f4" : "2px solid transparent",
      color: isActive ? "#4285f4" : "rgba(255,255,255,0.7)",
      fontWeight: isActive ? "bold" : "normal",
      transition: "all 0.2s ease",
      textAlign: "center",
      flex: 1 
    }}
    onClick={onClick}
  >
    {label}
  </div>
);

export default SlideUpPanel;