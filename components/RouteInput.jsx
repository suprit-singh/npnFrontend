// RouteInput.jsx
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Navigation, LogOut, User, Truck, RefreshCw } from 'lucide-react';

export function RouteInput({ user, onLogout, onSolveRoute, onViewDashboard }) {
  const [vehicleCapacity, setVehicleCapacity] = useState('');
  const [numVehicles, setNumVehicles] = useState('');
  const [fuelRequired, setFuelRequired] = useState('');
  const [mileage, setMileage] = useState('');
  const [customUserInput, setCustomUserInput] = useState('');
  const [toast, setToast] = useState(null);
  const [optimizationDone, setOptimizationDone] = useState(false);
  const [backendData, setBackendData] = useState(null);

  // New for trip-id listing
  const [tripIds, setTripIds] = useState([]); // [{trip_id, created_at}, ...]
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripIdInput, setSelectedTripIdInput] = useState('');

  const isFormValid = vehicleCapacity.trim() && numVehicles.trim();

  // Optimize request (unchanged)
  const handleSolve = async () => {
    if (!isFormValid) return;
    setToast({ type: "info", message: "Optimizing..." });
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://10.53.178.199:5000/api/solve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicleCapacity: vehicleCapacity.trim(),
          numVehicles: numVehicles.trim(),
          fuelRequired: fuelRequired.trim() || null,
          mileage: mileage.trim() || null,
          preference: customUserInput.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      setToast({ type: "success", message: data.message || "Optimized" });
      setBackendData(data);
      setOptimizationDone(true);

      if (typeof onSolveRoute === "function") onSolveRoute(data);
    } catch (err) {
      setToast({ type: "error", message: err.message || String(err) });
    }
  };

  // Sync (unchanged)
  const handleSyncData = async () => {
    setToast({ type: "info", message: "Syncing pending orders..." });
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://10.53.178.199:5000/api/orders/to-nodes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to sync data");
      setToast({ type: "success", message: data.message });
    } catch (err) {
      setToast({ type: "error", message: err.message || String(err) });
    }
  };

  // Fetch trip IDs from backend
  const fetchTripIds = async () => {
    setLoadingTrips(true);
    setToast({ type: "info", message: "Fetching trip IDs..." });
    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("http://10.53.178.199:5000/api/routes/trip-ids", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch trip IDs");
      const list = Array.isArray(data.trip_ids) ? data.trip_ids : [];
      setTripIds(list);
      setToast({ type: "success", message: `Fetched ${data.count ?? list.length} trips` });
    } catch (err) {
      setToast({ type: "error", message: err.message || String(err) });
    } finally {
      setLoadingTrips(false);
    }
  };

  // click listed trip -> fill input
  const handleSelectListedTrip = (tripId) => {
    setSelectedTripIdInput(tripId);
  };

  // Open dashboard with selected or backend trip id
  const openDashboardWithInput = () => {
    const idToOpen = (selectedTripIdInput && selectedTripIdInput.trim()) || (backendData?.trip_id);
    if (!idToOpen) {
      setToast({ type: "error", message: "Please enter or select a trip id" });
      return;
    }
    if (typeof onViewDashboard === "function") onViewDashboard(idToOpen);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white 
            ${toast.type === "info" ? "bg-blue-600" : ""} 
            ${toast.type === "success" ? "bg-green-600" : ""} 
            ${toast.type === "error" ? "bg-red-600" : ""}`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Navigation className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl text-gray-900">RouteOptimizer</h1>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">Welcome, {user.name}</span>
            </div>
            <Button
              onClick={() => {
                sessionStorage.removeItem("token");
                onLogout();
              }}
              variant="outline"
              size="sm"
              className="border-gray-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="text-center mb-8">
        <p className="text-gray-600 max-w-2xl mx-auto">
          Enter vehicle details to optimize your routes. Provide capacity, number of vehicles,
          and optionally fuel and mileage for accurate results.
        </p>
      </div>

      {/* Sync button */}
      <div className="w-full flex justify-center">
        <Button
          onClick={handleSyncData}
          className="p-6 max-w-xl mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 shadow-lg"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Sync Data
        </Button>
      </div>

      {/* Main form card */}
      <div className="max-w-lg mx-auto">
        <Card className="p-6 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <h2 className="mb-6 text-gray-900 flex items-center gap-2">
            <Truck className="h-5 w-5 text-blue-600" />
            Vehicle & Route Details
          </h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-gray-700">Vehicle Capacity</Label>
              <Input
                id="capacity"
                placeholder="Enter vehicle capacity"
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numVehicles" className="text-gray-700">Number of Vehicles</Label>
              <Input
                id="numVehicles"
                placeholder="Enter number of vehicles"
                value={numVehicles}
                onChange={(e) => setNumVehicles(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel" className="text-gray-700">Fuel Required (optional)</Label>
              <Input
                id="fuel"
                placeholder="Enter fuel required"
                value={fuelRequired}
                onChange={(e) => setFuelRequired(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mileage" className="text-gray-700">Mileage (optional)</Label>
              <Input
                id="mileage"
                placeholder="Enter mileage"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user" className="text-gray-700">User Input (optional)</Label>
              <Input
                id="user"
                placeholder="Enter your preference"
                value={customUserInput}
                onChange={(e) => setCustomUserInput(e.target.value)}
              />
            </div>

            {/* Optimize */}
            <Button
              onClick={handleSolve}
              disabled={!isFormValid}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-3 shadow-lg"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Optimize Route
            </Button>

            {/* View Dashboard (after optimize) */}
            {optimizationDone && (
              <Button
                onClick={() => {
                  if (backendData?.trip_id) {
                    if (typeof onViewDashboard === "function") onViewDashboard(backendData.trip_id);
                  } else {
                    if (typeof onViewDashboard === "function") onViewDashboard();
                  }
                }}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-3 shadow-lg"
              >
                View Dashboard
              </Button>
            )}

            {/* ----------------- Trip list / open UI ----------------- */}
            <div className="mt-6 p-4 border rounded-md bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium">Open Existing Trip</h3>
                <Button onClick={fetchTripIds} className="px-3 py-1" disabled={loadingTrips}>
                  {loadingTrips ? "Loading..." : "Fetch Trip IDs"}
                </Button>
              </div>

              <div className="max-h-40 overflow-auto mb-3">
                {tripIds.length === 0 ? (
                  <div className="text-sm text-gray-500">No trips found. Click "Fetch Trip IDs".</div>
                ) : (
                  <ul className="space-y-2">
                    {tripIds.map((t) => (
                      <li
                        key={t.trip_id}
                        className="cursor-pointer p-2 rounded hover:bg-white/60 bg-white/40 flex justify-between items-center"
                        onClick={() => handleSelectListedTrip(t.trip_id)}
                        title={`Created at: ${t.created_at ?? "unknown"}`}
                      >
                        <div className="truncate text-sm">{t.trip_id}</div>
                        <div className="text-xs text-gray-500 ml-4">{t.created_at ? new Date(t.created_at).toLocaleString() : ""}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tripIdInput" className="text-gray-700">Trip ID</Label>
                <Input
                  id="tripIdInput"
                  placeholder="Paste or click a trip id from the list"
                  value={selectedTripIdInput}
                  onChange={(e) => setSelectedTripIdInput(e.target.value)}
                />
                <div className="flex gap-2 mt-2">
                  <Button onClick={openDashboardWithInput} className="flex-1">
                    Open Dashboard
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedTripIdInput('');
                    }}
                    className="flex-none bg-white border"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
            {/* ----------------- end trip UI ----------------- */}
          </div>
        </Card>
      </div>
    </div>
  );
}
