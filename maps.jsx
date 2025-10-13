import React, { useState } from "react";

const Map = () => {
  const [selectedCity, setSelectedCity] = useState(null);

  const cities = [
    { id: 1, name: "somu", x: 100, y: 150, population: "32.9M", color: "#3b82f6" },
    { id: 2, name: "arun", x: 300, y: 100, population: "20.4M", color: "#8b5cf6" },
    { id: 3, name: "kavin", x: 400, y: 200, population: "12.3M", color: "#ec4899" },
    { id: 4, name: "geetha", x: 200, y: 220, population: "14.8M", color: "#f59e0b" },
    { id: 5, name: "rani", x: 350, y: 250, population: "10.9M", color: "#10b981" }
  ];

  // Define specific connections between cities
  const connections = [
 // Delhi to Kolkata
  ];

  const handleCityClick = (city) => {
    setSelectedCity(city);
  };

  const getCityById = (id) => cities.find(city => city.id === id);

  return (
    <div style={{
      width: "100%",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "900px",
        background: "white",
        borderRadius: "20px",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        padding: "30px",
        position: "relative"
      }}>
        <h1 style={{
          margin: "0 0 10px 0",
          fontSize: "32px",
          color: "#1f2937",
          textAlign: "center"
        }}>
          Interactive City Map
        </h1>
        <p style={{
          margin: "0 0 30px 0",
          color: "#6b7280",
          textAlign: "center"
        }}>
          Click on any city to view details
        </p>

        <svg viewBox="0 0 500 300" style={{
          width: "100%",
          height: "auto",
          border: "2px solid #e5e7eb",
          borderRadius: "12px",
          background: "linear-gradient(to bottom, #e0f2fe 0%, #fef3c7 100%)"
        }}>
          {/* Decorative elements for map look */}
          <defs>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Connection lines between specific cities */}
          {connections.map((conn, index) => {
            const fromCity = getCityById(conn.from);
            const toCity = getCityById(conn.to);
            return (
              <line
                key={index}
                x1={fromCity.x}
                y1={fromCity.y}
                x2={toCity.x}
                y2={toCity.y}
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="5,5"
                opacity="0.6"
              />
            );
          })}

          {/* Cities */}
          {cities.map((city) => (
            <g key={city.id}>
              {/* Pulse animation ring for selected city */}
              {selectedCity?.id === city.id && (
                <circle
                  cx={city.x}
                  cy={city.y}
                  r="20"
                  fill="none"
                  stroke={city.color}
                  strokeWidth="2"
                  opacity="0.3"
                >
                  <animate
                    attributeName="r"
                    from="15"
                    to="25"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    from="0.6"
                    to="0"
                    dur="1.5s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}

              {/* City marker */}
              <circle
                cx={city.x}
                cy={city.y}
                r="12"
                fill={city.color}
                stroke="white"
                strokeWidth="3"
                style={{
                  cursor: "pointer",
                  filter: selectedCity?.id === city.id ? "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" : "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
                  transition: "all 0.3s ease"
                }}
                onClick={() => handleCityClick(city)}
                onMouseOver={(e) => {
                  e.target.setAttribute("r", "15");
                }}
                onMouseOut={(e) => {
                  e.target.setAttribute("r", "12");
                }}
              />

              {/* City name label */}
              <text
                x={city.x}
                y={city.y - 20}
                textAnchor="middle"
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  fill: "#1f2937",
                  pointerEvents: "none",
                  userSelect: "none",
                  textShadow: "0 1px 2px rgba(255,255,255,0.8)"
                }}
              >
                {city.name}
              </text>
            </g>
          ))}
        </svg>

        {/* City Details Panel */}
        {selectedCity && (
          <div style={{
            marginTop: "20px",
            padding: "20px",
            background: `linear-gradient(135deg, ${selectedCity.color}15, ${selectedCity.color}05)`,
            borderRadius: "12px",
            border: `2px solid ${selectedCity.color}30`,
            animation: "fadeIn 0.3s ease"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: selectedCity.color
              }} />
              <h3 style={{ margin: 0, color: "#1f2937", fontSize: "24px" }}>
                {selectedCity.name}
              </h3>
            </div>
            <div style={{ marginTop: "12px", color: "#4b5563" }}>
              <p style={{ margin: "8px 0" }}>
                <strong>Population:</strong> {selectedCity.population}
              </p>
              <p style={{ margin: "8px 0" }}>
                <strong>Coordinates:</strong> ({selectedCity.x}, {selectedCity.y})
              </p>
            </div>
          </div>
        )}

        {!selectedCity && (
          <div style={{
            marginTop: "20px",
            padding: "20px",
            background: "#f3f4f6",
            borderRadius: "12px",
            textAlign: "center",
            color: "#6b7280"
          }}>
            Select a city on the map to view its information
          </div>
        )}

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Map;