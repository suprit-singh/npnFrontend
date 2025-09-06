// App.jsx
import React, { useState } from "react";
import { RouteInput } from "./components/RouteInput";
import Dashboard from "./components/Dashboard";
import RouteMap from "./components/RouteMap";
//import { ChatBot } from "./components/ChatBot";
import { AuthPage } from "./components/AuthPage";
import { LandingPage } from "./components/LandingPage";

/**
 * App with a global Back button that preserves all state.
 * - history: array of previous page keys, e.g. ["input", "dashboard"]
 * - navigateTo(page, push = true) pushes current page on history (if push) then navigates
 * - goBack() pops last page and navigates to it (if available)
 */

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [history, setHistory] = useState([]); // Simple stack of previous pages
  const [user, setUser] = useState(null);

  // FULL backend response stored here (important)
  const [routeData, setRouteData] = useState(null);
  const [tripId, setTripId] = useState(null);
  const [routeResult, setRouteResult] = useState(null);

  // ----- Navigation helpers -----
  // navigateTo: change page, optionally push current page onto history stack
  const navigateTo = (page, push = true) => {
    setHistory((prev) => {
      if (!push) return prev;
      // push current page if it's different from the target (avoid duplicates)
      if (currentPage && currentPage !== page) return [...prev, currentPage];
      return prev;
    });
    setCurrentPage(page);
  };

  // goBack: pop last page from stack and navigate to it
  const goBack = () => {
    setHistory((prev) => {
      if (!prev || prev.length === 0) return prev;
      const newHistory = [...prev];
      const last = newHistory.pop();
      setCurrentPage(last);
      return newHistory;
    });
  };

  // Utility: clear history (e.g., on logout)
  const clearHistory = () => setHistory([]);

  // Handle login
  const handleLogin = (userData) => {
    setUser(userData);
    // navigate to input and push landing into history
    navigateTo("input", true);
  };

  const handleLogout = () => {
    // keep a clean app state
    sessionStorage.removeItem("token");
    setUser(null);
    setRouteData(null);
    setTripId(null);
    setRouteResult(null);
    clearHistory();
    setCurrentPage("landing");
  };

  // This must accept the full backend response (data)
  const handleSolveRoute = (data) => {
    setRouteData(data.route); // route JSON (depot, ortools, refined_routes)
    setRouteResult(data.summary); // summary
    setTripId(data.trip_id);
    try {
      sessionStorage.setItem("last_routeData", JSON.stringify(data.route));
    } catch (e) {
      console.error("Failed to save routeData to sessionStorage:", e);
    }
  };

  // Exposed show map helper (navigates to map and pushes current page)
  const handleShowMap = () => {
    navigateTo("map", true);
  };

  // ---------------- render the chosen page into `content` ----------------
  let content = null;
  switch (currentPage) {
    case "landing":
      content = <LandingPage onGetStarted={() => navigateTo("auth")} onLogoClick={() => navigateTo("landing", false)} />;
      break;

    case "auth":
      content = <AuthPage onLogin={(userData) => { handleLogin(userData); }} />;
      break;

    case "input":
      content = (
        <div>
          <RouteInput
            onSolveRoute={(data) => handleSolveRoute(data)}
            user={user}
            onLogout={() => {
              handleLogout();
            }}
            // IMPORTANT: accept optional tripId param from RouteInput
            onViewDashboard={(id) => {
              if (id) setTripId(id);
              // navigate to dashboard and push current page into history
              navigateTo("dashboard", true);
            }}
          />
        </div>
      );
      break;

    case "dashboard":
      content = (
        <Dashboard
          trip_id={tripId}
          onShowMap={() => handleShowMap()}
          routeData={routeData}
        />
      );
      break;

    case "map":
      content = (
        <RouteMap
          routes={routeData?.refined_routes ?? []}
          depot={routeData?.depot ?? null}
        />
      );
      break;

    default:
      content = null;
  }

  // ---------- Top-level layout with persistent Back button ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header bar: only show after leaving landing page */}
      {currentPage !== "landing" && (
        <header className="flex items-center justify-between px-4 py-3 shadow-sm bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Back button: visible only if history is not empty */}
            <button
              onClick={goBack}
              disabled={history.length === 0}
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border ${
                history.length === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-100"
              }`}
              title={history.length === 0 ? "No previous page" : "Go back"}
            >
              ← Back
            </button>

            {/* Home / logo quick nav (doesn't push current page) */}
            <button
              onClick={() => navigateTo("landing", false)}
              className="text-lg font-semibold"
            >
              RouteOptimizer
            </button>
          </div>

          {/* Right-side: session controls */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="px-3 py-1 rounded-md bg-gray-50 text-sm">Welcome, {user.name}</div>
                <button
                  onClick={() => handleLogout()}
                  className="px-3 py-1 rounded-md border hover:bg-red-50 text-sm"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <button onClick={() => navigateTo("auth", true)} className="px-3 py-1 rounded-md border hover:bg-gray-100 text-sm">
                Sign In
              </button>
            )}
          </div>
        </header>
      )}

      {/* Main content (pages) */}
      <main className="max-w-7xl mx-auto p-4">
        {content}
      </main>

      {/* Keep ChatBot shown on all pages */}
      {/* <footer className="fixed right-6 bottom-6">
        <ChatBot />
      </footer> */}
    </div>
  );
}
