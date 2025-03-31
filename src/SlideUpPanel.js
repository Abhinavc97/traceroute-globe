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
          Traceroute Visualizer offers a unique approach compared to running a traceroute from your own computer. 
          Typically, a traceroute is initiated locally when diagnosing network outages or packet loss, helping 
          identify where issues occur along the route. The results highlight hops with abnormal latency, packet loss, 
          or complete failure to forward packets.
        </p>
        <p>
          When using Traceroute Visualizer, the originating system is hosted in an AWS data center in Columbus, Ohio. 
          This means all traffic first travels through AWS's backbone infrastructure before reaching the public internet. 
          AWS often employs private or internal routing mechanisms, which can cause initial hops to appear different from 
          what you'd see on a standard traceroute. However, this setup allows you to test connectivity from our system 
          to any destination worldwide, providing an independent perspective on network performance beyond your current location.
        </p>
      </div>
    ),
    mapping: (
      <div>
        <h3 style={{ marginTop: 0, color: '#4285f4' }}>Mapping Traceroute</h3>
        <p>
          Visualizing network paths through traceroute provides valuable insights into the geographic journey of an 
          internet connection. Our online traceroute tool processes raw traceroute output, extracts relevant data, and plots 
          the results on an interactive world map.
        </p>
        <p>
          Starting from our server on the East Coast of the USA, this test displays response times for each reachable hop 
          along the route. However, geolocation accuracy can vary, and occasional discrepancies may occur in the mapped results.
        </p>
        <p>
          You'll notice that the plotted paths originate from the testing server itself. This approach clearly illustrates 
          the response times between the source and each destination hop. While movies often depict seamless traceroute 
          visualizations, accurately mapping IP addresses remains a challenge due to the complexities of IP geolocation data.
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
        {/* Tab navigation - now justified */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid rgba(255,255,255,0.2)",
          background: "rgba(20,20,20,0.5)",
          justifyContent: "space-between" // This spaces the tabs evenly
        }}>
          <TabButton 
            label="About" 
            isActive={activeTab === 'about'} 
            onClick={() => setActiveTab('about')}
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
      flex: 1 // Make each tab take equal width
    }}
    onClick={onClick}
  >
    {label}
  </div>
);

export default SlideUpPanel;