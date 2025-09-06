// RouteMap.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  useMap,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Add leaflet-routing-machine import (must be installed)
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// icons
const petrolIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149060.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const repairIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2967/2967350.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

const depotIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [34, 34],
  iconAnchor: [17, 34],
});

// color palette
const routeColors = ["#EF4444", "#2563EB", "#16A34A", "#8B5CF6", "#F97316", "#7C3AED", "#0EA5A4"];

function FitAllBounds({ routes, depot, selectedVehicle }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !Array.isArray(routes)) return;

    let allPoints = [];

    if (depot && typeof depot.lat === "number" && typeof depot.lon === "number") {
      allPoints.push([depot.lat, depot.lon]);
    }

    routes.forEach((route) => {
      if (selectedVehicle && route.vehicle !== selectedVehicle) return;
      if (!Array.isArray(route.sequence)) return;
      route.sequence.forEach((p) => {
        if (p && typeof p.lat === "number" && typeof p.lon === "number") {
          allPoints.push([p.lat, p.lon]);
        }
      });
    });

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [map, routes, depot, selectedVehicle]);

  return null;
}

/**
 * RoutingControl: uses leaflet-routing-machine to draw a route along roads for a single route
 * - waypoints: array of [lat, lon]
 * - color: stroke color
 * - active: whether to draw it prominently (if not active, we'll draw faint line by options)
 *
 * Note: By default L.Routing.OSRMv1() points to OSRM's demo server. For production, provide your own router.
 */
function RoutingControl({ waypoints, color = "#2563EB", active = true }) {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (!Array.isArray(waypoints) || waypoints.length < 2) {
      // if control exists but we don't have valid waypoints, remove it
      if (controlRef.current) {
        try {
          map.removeControl(controlRef.current);
        } catch (e) {}
        controlRef.current = null;
      }
      return;
    }

    // convert to L.latLng
    const wp = waypoints.map((p) => L.latLng(p[0], p[1]));

    if (!controlRef.current) {
      // create control once
      controlRef.current = L.Routing.control({
        waypoints: wp,
        show: true,                 // hide itinerary UI (change if you want)
        routeWhileDragging: false,
        position: "bottomright",
        showAlternatives: false,
        addWaypoints: false,
        fitSelectedRoutes: false, // we manage bounds externally
        lineOptions: {
          styles: [{ color: color, weight: active ? 5 : 2, opacity: active ? 0.95 : 0.25 }],
        },
        createMarker: () => null, // we will show our own markers
      }).addTo(map);
    } else {
      // update waypoints on the existing control
      try {
        controlRef.current.setWaypoints(wp);
        // optionally update other options by re-creating if necessary
      } catch (e) {
        // some routers may throw; in that case recreate control
        try {
          map.removeControl(controlRef.current);
        } catch (err) {}
        controlRef.current = L.Routing.control({
          waypoints: wp,
          show: false,
          routeWhileDragging: false,
          position: "bottomright",
          showAlternatives: false,
          addWaypoints: false,
          fitSelectedRoutes: false,
          lineOptions: {
            styles: [{ color: color, weight: active ? 5 : 2, opacity: active ? 0.95 : 0.25 }],
          },
          createMarker: () => null,
        }).addTo(map);
      }
    }

    return () => {
      // cleanup when component unmounts
      if (controlRef.current) {
        try {
          map.removeControl(controlRef.current);
        } catch (e) {}
        controlRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, JSON.stringify(waypoints), color, active]);

  return null;
}


export default function RouteMap({ routes: propRoutes, depot: propDepot }) {
  const [routes, setRoutes] = useState(Array.isArray(propRoutes) ? propRoutes : []);
  const [depot, setDepot] = useState(propDepot || null);
  const [selectedVehicle, setSelectedVehicle] = useState("All");
  const [loading, setLoading] = useState(false);

  // load logic: prefer props -> sessionStorage -> backend latest
  useEffect(() => {
    if (Array.isArray(propRoutes) && propRoutes.length > 0) {
      setRoutes(propRoutes);
      setDepot(propDepot ?? null);
      return;
    }

    const saved = sessionStorage.getItem("last_routeData");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setDepot(parsed.depot ?? null);
        setRoutes(Array.isArray(parsed.refined_routes) ? parsed.refined_routes : []);
        return;
      } catch (e) {
        console.warn("Failed to parse last_routeData", e);
      }
    }

    const fetchRoutes = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://10.53.178.199:5000/api/routes/latest");
        const json = await res.json();
        if (json && json.route) {
          setDepot(json.route.depot || null);
          setRoutes(Array.isArray(json.route.refined_routes) ? json.route.refined_routes : []);
          try {
            sessionStorage.setItem("last_routeData", JSON.stringify(json.route));
          } catch (e) {}
        } else {
          setRoutes([]);
          setDepot(null);
        }
      } catch (err) {
        console.error("Error loading latest routes:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
    const interval = setInterval(fetchRoutes, 30000);
    return () => clearInterval(interval);
  }, [propRoutes, propDepot]);

  const vehicles = useMemo(() => {
    const ids = [];
    (routes || []).forEach((r) => {
      const id = r.vehicle ?? null;
      if (id && !ids.includes(id)) ids.push(id);
    });
    return ids;
  }, [routes]);

  const colorForIndex = (i) => routeColors[i % routeColors.length];

  const routeLines = useMemo(() => {
    if (!Array.isArray(routes)) return [];
    return routes.map((r, idx) => {
      const seq = Array.isArray(r.sequence) ? r.sequence : [];
      const pts = seq
        .filter((p) => p && typeof p.lat === "number" && typeof p.lon === "number")
        .map((p) => [p.lat, p.lon]);
      return { vehicle: r.vehicle ?? `Route ${idx + 1}`, points: pts, idx, raw: r };
    });
  }, [routes]);

  const handleSelect = (e) => setSelectedVehicle(e.target.value);

  if (loading) return <div className="p-4">Loading map...</div>;

  return (
    <div className="w-full h-screen relative">
      {/* controls */}
      <div className="absolute top-4 left-4 z-[1100] bg-white rounded-lg shadow p-3 text-sm">
        <div className="mb-2 font-semibold">Show vehicle</div>
        <select value={selectedVehicle} onChange={handleSelect} className="border rounded px-2 py-1">
          <option value="All">All vehicles</option>
          {vehicles.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>

        <div className="mt-3 text-xs space-y-1">
          <div className="flex items-center gap-2">
            <div style={{ width: 12, height: 6, background: "#000", opacity: 0.8 }} /> <span>Route (road-following)</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={petrolIcon.options.iconUrl} alt="petrol" className="w-4 h-4" /> <span>Petrol Pump</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={repairIcon.options.iconUrl} alt="repair" className="w-4 h-4" /> <span>Repair Shop</span>
          </div>
          <div className="flex items-center gap-2">
            <img src={depotIcon.options.iconUrl} alt="depot" className="w-4 h-4" /> <span>Depot / Warehouse</span>
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="absolute top-4 right-4 z-[1100] bg-white rounded-lg shadow p-3 text-sm">
        <div className="font-semibold mb-2">Legend</div>
        <ul className="space-y-1">
          {routeLines.map((r) => {
            const color = colorForIndex(r.idx);
            const muted = selectedVehicle !== "All" && selectedVehicle !== r.vehicle;
            return (
              <li key={`legend-${r.vehicle}`} className="flex items-center gap-2">
                <span style={{ width: 16, height: 8, background: color, display: "inline-block", opacity: muted ? 0.35 : 1 }} />
                <span style={{ opacity: muted ? 0.6 : 1 }}>{r.vehicle}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <MapContainer center={[20, 78]} zoom={5} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OSM" />

        <FitAllBounds routes={routes} depot={depot} selectedVehicle={selectedVehicle} />

        {/* depot */}
        {depot && typeof depot.lat === "number" && typeof depot.lon === "number" && (
          <Marker position={[depot.lat, depot.lon]} icon={depotIcon}>
            <Popup>
              <strong>Depot / Warehouse</strong>
              <br />
              ID: {depot.id ?? "-"}
              <br />
              Lat: {depot.lat}, Lon: {depot.lon}
            </Popup>
          </Marker>
        )}

        {/* render routing for each route */}
        {routeLines.map((r) => {
          const show = selectedVehicle === "All" || selectedVehicle === r.vehicle;
          const color = colorForIndex(r.idx);

          return (
            <React.Fragment key={`routefrag-${r.vehicle}`}>
              {/* Use routing control to draw road-following path if at least 2 pts */}
              {r.points.length >= 2 && (
                <RoutingControl
                  waypoints={r.points}
                  color={color}
                  active={show}
                />
              )}

              {/* Show stops as CircleMarker + permanent tooltip label with customer id */}
              {r.raw.sequence &&
                r.raw.sequence.map((pt, i) => {
                  if (!pt || typeof pt.lat !== "number" || typeof pt.lon !== "number") return null;
                  if (!show) return null;
                  return (
                    <CircleMarker
                      key={`wpt-${r.vehicle}-${i}`}
                      center={[pt.lat, pt.lon]}
                      radius={6}
                      color={color}
                      fillColor={color}
                      fillOpacity={0.95}
                    >
                      <Popup>
                        <strong>Stop {i + 1}</strong>
                        <br />
                        ID: {pt.id ?? "-"}
                        <br />
                        Vehicle: {r.vehicle}
                      </Popup>

                      {/* permanent label displayed next to the marker */}
                      <Tooltip permanent direction="right" offset={[8, 0]}>
                        {pt.id ?? `Stop ${i + 1}`}
                      </Tooltip>
                    </CircleMarker>
                  );
                })}

              {/* petrol & repair markers */}
              {r.raw.sequence &&
                r.raw.sequence.flatMap((pt, i) => {
                  if (!pt) return [];
                  if (!show) return [];
                  const stations = Array.isArray(pt.nearby_petrol_stations) ? pt.nearby_petrol_stations : [];
                  const shops = Array.isArray(pt.nearby_repair_shops) ? pt.nearby_repair_shops : [];

                  const sMarkers = stations.map((s, j) => {
                    if (!s || typeof s.lat !== "number" || typeof s.lon !== "number") return null;
                    return (
                      <Marker key={`petrol-${r.vehicle}-${i}-${j}`} position={[s.lat, s.lon]} icon={petrolIcon}>
                        <Popup>
                          <strong>⛽ {s.name ?? "Petrol"}</strong>
                          <br />
                          {s.address ?? ""}
                          <br />
                          From stop: {pt.id ?? `#${i + 1}`}
                        </Popup>
                      </Marker>
                    );
                  });

                  const rMarkers = shops.map((sh, j) => {
                    if (!sh || typeof sh.lat !== "number" || typeof sh.lon !== "number") return null;
                    return (
                      <Marker key={`repair-${r.vehicle}-${i}-${j}`} position={[sh.lat, sh.lon]} icon={repairIcon}>
                        <Popup>
                          <strong>🔧 {sh.name ?? "Repair"}</strong>
                          <br />
                          {sh.address ?? ""}
                          <br />
                          From stop: {pt.id ?? `#${i + 1}`}
                        </Popup>
                      </Marker>
                    );
                  });

                  return [...sMarkers, ...rMarkers];
                })}
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
}
