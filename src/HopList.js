import React, { useState, useEffect } from 'react';
import './HopList.css';

const HopList = ({ hops, isLoading, isDataReceived }) => {
  // State to track whether the panel is open or closed
  const [isOpen, setIsOpen] = useState(false);
  
  // Filter out only the hops with valid location data
  const validHops = hops.filter(hop => hop.latitude && hop.longitude);
  
  // Toggle the panel open/closed
  const togglePanel = () => {
    setIsOpen(!isOpen);
  };
  
  // Reset panel to closed state when new trace starts
  useEffect(() => {
    if (isLoading) {
      setIsOpen(false);
    }
  }, [isLoading]);
  
  return (
    <div className={`hop-list-container ${isOpen ? 'open' : 'closed'}`}>
      {/* The handle is only visible when data is received and not loading */}
      {isDataReceived && !isLoading && (
        <div 
          className={`hop-list-handle ${isOpen ? 'open' : 'closed'}`}
          onClick={togglePanel}
        >
          <div className="handle-icon">
            {isOpen ? '◀' : '▶'}
          </div>
          <div className="handle-label">
            {isOpen ? 'Hide' : 'Show'} Hops
          </div>
        </div>
      )}
      
      <div className="hop-list-content">
        <div className="hop-list-header">
          <h3>Traceroute Path</h3>
          <span className="hop-count">{validHops.length} hops</span>
        </div>
        
        <div className="hop-list">
          {validHops.map((hop, index) => {
            const isStart = index === 0;
            const isEnd = index === validHops.length - 1;
            const nextHop = index < validHops.length - 1 ? validHops[index + 1] : null;
            
            // Determine if there are unknown hops between current and next hop
            const hasUnknownHopsBetween = nextHop && 
                                        (hops.indexOf(nextHop) - hops.indexOf(hop) > 1);
            
            return (
              <div key={index} className="hop-item">
                <div className="hop-marker">
                  <div className={`hop-point ${isStart ? 'start' : isEnd ? 'end' : 'intermediate'}`}></div>
                  {!isEnd && (
                    <div className={`hop-line ${hasUnknownHopsBetween ? 'unknown' : ''}`}></div>
                  )}
                </div>
                <div className="hop-details">
                  <div className="hop-location">
                    {isStart && <span className="hop-tag start-tag">START</span>}
                    {isEnd && <span className="hop-tag end-tag">END</span>}
                    <span className="hop-city">{hop.city || 'Unknown'}</span>
                    {hop.region && <span className="hop-region">, {hop.region}</span>}
                  </div>
                  <div className="hop-ip">{hop.ip || 'Unknown IP'}</div>
                  {hasUnknownHopsBetween && (
                    <div className="unknown-hops-indicator">
                      Unknown hops between this location and next
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HopList;