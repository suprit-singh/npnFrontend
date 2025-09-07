import React, { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    ScatterChart,
    Scatter,
    Cell,
} from "recharts";
import {
    Truck,
    Gauge,
    Fuel,
    Clock3,
    MapPin,
    Layers,
    Cog,
    Brain,
    Map as MapIcon,
    Workflow,
    Bot,
    Send,
    Wrench,
    Fuel as FuelIcon,
    Activity,
} from "lucide-react";

/**
 * Pastel, high-contrast theme (egg-white & light blue)
 */
const theme = {
    bg: "#FFFBF2",
    surface: "#FFFFFF",
    surfaceMuted: "#F5FAFF",
    text: "#0F172A",
    textMuted: "#475569",
    border: "#E2E8F0",
    primary: "#3B82F6",
    primaryDark: "#2563EB",
    chip: "#E6F0FF",
    chart: {
        blue600: "#2563EB",
        blue400: "#60A5FA",
        blue300: "#93C5FD",
        teal500: "#14B8A6",
        teal400: "#2DD4BF",
        green500: "#22C55E",
        amber500: "#F59E0B",
        red500: "#EF4444",
        slate500: "#64748B",
        purple500: "#8B5CF6",
    },
};

/* ---- tiny UI primitives ---- */
const cx = (...c) => c.filter(Boolean).join(" ");
const Card = ({ className = "", children, tone = "default" }) => (
    <div
        className={cx("rounded-2xl border shadow-sm", tone === "muted" ? "" : "", className)}
        style={{ background: tone === "muted" ? theme.surfaceMuted : theme.surface, borderColor: theme.border }}
    >
        {children}
    </div>
);
const CardContent = ({ className = "", children }) => <div className={cx("p-4", className)}>{children}</div>;
const Button = ({ className = "", children, style, ...props }) => (
    <button
        className={cx("inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium border", className)}
        style={{ background: theme.primary, color: "#fff", borderColor: theme.primaryDark, ...style }}
        {...props}
    >
        {children}
    </button>
);
const Badge = ({ className = "", variant = "default", children, style }) => (
    <span
        className={cx("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium border", className)}
        style={{
            background: variant === "secondary" ? theme.chip : theme.primary,
            color: variant === "secondary" ? theme.text : "#fff",
            borderColor: theme.border,
            ...style,
        }}
    >
        {children}
    </span>
);
const Input = ({ className = "", style, ...props }) => (
    <input
        className={cx("w-full rounded-lg border px-3 py-2 text-sm", className)}
        style={{ background: theme.surface, color: theme.text, borderColor: theme.border, outlineColor: theme.primary, outlineOffset: 0, ...style }}
        {...props}
    />
);
const Textarea = ({ className = "", style, ...props }) => (
    <textarea
        className={cx("w-full rounded-lg border px-3 py-2 text-sm", className)}
        style={{ background: theme.surface, color: theme.text, borderColor: theme.border, outlineColor: theme.primary, outlineOffset: 0, ...style }}
        {...props}
    />
);

function Tabs({ defaultValue, children, className = "" }) {
    const [val, setVal] = useState(defaultValue);
    return (
        <div className={className} data-tabs-value={val}>
            {React.Children.map(children, (child) =>
                React.isValidElement(child) ? React.cloneElement(child, { __tabsValue: val, __setTabsValue: setVal }) : child
            )}
        </div>
    );
}
const TabsList = ({ children, className = "", __tabsValue, __setTabsValue }) => (
    <div className={cx("grid grid-cols-2 rounded-xl overflow-hidden", className)} style={{ border: `1px solid ${theme.border}` }}>
        {React.Children.map(children, (child) =>
            React.isValidElement(child) ? React.cloneElement(child, { __tabsValue, __setTabsValue }) : child
        )}
    </div>
);
const TabsTrigger = ({ value, children, className = "", __tabsValue, __setTabsValue }) => (
    <button
        onClick={() => __setTabsValue(value)}
        className={cx("px-3 py-2 text-sm font-medium border-r last:border-r-0", className)}
        style={{
            background: __tabsValue === value ? theme.surface : theme.surfaceMuted,
            color: __tabsValue === value ? theme.text : theme.textMuted,
            borderColor: theme.border,
        }}
    >
        {children}
    </button>
);
const TabsContent = ({ value, children, __tabsValue, className = "" }) => <div className={cx(__tabsValue === value ? "block" : "hidden", className)}>{children}</div>;

/* ----------------- VrpDashboard ----------------- */
function VrpDashboard({ trip_id, initialData = null, onShowMap }) {
    const [vehicleFilter, setVehicleFilter] = useState("");
    const [data, setData] = useState(initialData ?? null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    console.log("trip_id:", trip_id);

    // 🔹 Fetch backend routes (unchanged hook usage)
    useEffect(() => {

        if (initialData) {
            setData(initialData);
            setError(null);
            setLoading(false);
            return;
        }

        if (!trip_id) {
            setData(null);
            // do not fetch if there's no trip; keep loading false
            setLoading(false);
            return;
        }

        const fetchRoutes = async () => {
            try {
                setLoading(true);
                setError(null);

                const token = sessionStorage.getItem("token");
                console.log(`I am ${trip_id}`);
                const res = await fetch(`http://127.0.0.1:5000/api/routes/${trip_id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                let json;
                try {
                    json = await res.json();
                } catch (parseErr) {
                    const text = await res.text().catch(() => "<unreadable response body>");
                    console.error("Failed to parse JSON from /api/routes response:", parseErr, "body:", text);
                    throw new Error(`Invalid JSON response from server (status ${res.status})`);
                }

                if (!res.ok) {
                    const serverMsg = json?.message || json?.error || `Server responded with status ${res.status}`;
                    throw new Error(serverMsg);
                }
                const routePayload = json.route ?? json;
                setData(routePayload);

                try {
                    sessionStorage.setItem("last_routeData", JSON.stringify(routePayload));
                } catch (e) {
                    console.warn("Unable to save last_routeData to sessionStorage:", e);
                }
                console.log("Fetched route JSON:", routePayload);


            } catch (err) {
                console.error("fetchRoutes error:", err);
                setError(err.message || "Failed to fetch dashboard data");
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, [trip_id, initialData]);

    /* ===================== Important: Derived values & hooks (UNCONDITIONAL) ===================== */
    // Ensure these run on every render so Hooks order doesn't change.
    const depot = data?.depot ?? null;
    const ortools = data?.ortools ?? [];
    const refined = data?.refined_routes ?? [];

    // ---------- helpers ----------
    const toSeconds = (mins, secs) => {
        if (typeof secs === "number") return secs;
        if (typeof mins === "number") return Math.round(mins * 60);
        return 0;
    };

    const ecoScoreNumeric = (score) => {
        if (!score) return null;
        const m = { low: 1, medium: 2, high: 3 };
        return m[String(score).toLowerCase()] ?? null;
    };

    // ---------- Base AI KPIs ----------
    const baseKpis = useMemo(() => {
        const totalVehicles = ortools.length;
        const activeVehicles = ortools.filter((v) => (v.route ?? []).length > 0).length;
        const idleVehicles = totalVehicles - activeVehicles;

        const totalDistance = ortools.reduce((acc, v) => acc + (Number(v.total_distance_km) || 0), 0);
        const totalFuelUsed = ortools.reduce((acc, v) => acc + (Number(v.fuel_used_l) || 0), 0);
        const totalFuelCost = ortools.reduce((acc, v) => acc + (Number(v.fuel_cost) || 0), 0);
        const totalLoad = ortools.reduce((acc, v) => acc + (Number(v.load) || 0), 0);

        const byVehicle = ortools.map((v) => ({
            vehicle_id: String(v.vehicle_id),
            distance_km: Number(v.total_distance_km) || 0,
            fuel_l: Number(v.fuel_used_l) || 0,
            fuel_cost: Number(v.fuel_cost) || 0,
            load: Number(v.load) || 0,
            stops: (v.route ?? []).length,
            isActive: (v.route ?? []).length > 0,
        }));

        const filteredByVehicle = vehicleFilter ? byVehicle.filter((x) => x.vehicle_id.includes(vehicleFilter)) : byVehicle;

        return {
            totalVehicles,
            activeVehicles,
            idleVehicles,
            totalDistance,
            totalFuelUsed,
            totalFuelCost,
            totalLoad,
            byVehicle,
            filteredByVehicle,
        };
    }, [ortools, vehicleFilter]);

    // ---------- Refined Routes KPIs ----------
    const genaiKpis = useMemo(() => {
        const routes = refined.map((r, i) => {
            const normalSecs = toSeconds(r?.metrics?.total_normal_duration_mins, r?.metrics?.total_normal_duration_secs);
            const trafficSecs = toSeconds(r?.metrics?.total_traffic_duration_mins, r?.metrics?.total_traffic_duration_secs);
            const delayPct = normalSecs > 0 ? (trafficSecs - normalSecs) / normalSecs : 0;

            const seq = r?.sequence ?? [];
            const fuelStations = seq.reduce((a, s) => {
                if (Array.isArray(s?.nearby_petrol_stations)) return a + s.nearby_petrol_stations.length;
                return a + (Number(s?.nearby_petrol_stations) || 0);
            }, 0);
            const repairShops = seq.reduce((a, s) => {
                if (Array.isArray(s?.nearby_repair_shops)) return a + s.nearby_repair_shops.length;
                return a + (Number(s?.nearby_repair_shops) || 0);
            }, 0);

            // compute derived operational metrics requested by user
            const dist = Number(r.total_distance_km) || 0;
            const fuel = Number(r?.metrics?.fuel_used_l) || 0;
            const fuelPerKm = dist > 0 ? Number((fuel / dist).toFixed(4)) : null;

            const stopsCount = (r?.sequence ?? []).filter((s) => s?.id && s.id !== depot?.id).length;
            const durationSecs = trafficSecs || normalSecs || 0;
            const durationHours = durationSecs > 0 ? durationSecs / 3600 : null;
            const workloadIndex = durationHours && stopsCount > 0 ? Math.round((stopsCount / durationHours) * 10) : null;

            return {
                idx: i,
                vehicle: r.vehicle ?? `V${i + 1}`,
                distance_km: dist,
                fuel_l: fuel,
                fuel_cost: Number(r?.metrics?.fuel_cost) || 0,
                eco_score: r?.metrics?.eco_score ?? null,
                eco_score_num: ecoScoreNumeric(r?.metrics?.eco_score),
                normal_secs: normalSecs,
                traffic_secs: trafficSecs,
                delay_pct: delayPct,
                stops: stopsCount,
                traffic_level: r?.metrics?.traffic_level ?? "",
                road_condition: r?.metrics?.road_condition ?? "",
                notes: r?.metrics?.notes ?? "",
                sequence: seq,
                fuelStations,
                repairShops,
                metrics: r?.metrics ?? {},
                // new fields
                fuelPerKm,
                workloadIndex,
            };
        });

        const totalDistance = routes.reduce((a, x) => a + x.distance_km, 0);
        const totalFuel = routes.reduce((a, x) => a + x.fuel_l, 0);
        const totalCost = routes.reduce((a, x) => a + x.fuel_cost, 0);
        const totalFuelStations = routes.reduce((a, x) => a + x.fuelStations, 0);
        const totalRepairShops = routes.reduce((a, x) => a + x.repairShops, 0);
        const totalStops = routes.reduce((a, x) => a + x.stops, 0);

        const avgEcoScore = (() => {
            const nums = routes.map((x) => x.eco_score_num).filter((n) => n != null);
            if (!nums.length) return null;
            const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
            if (avg >= 2.5) return "high";
            if (avg >= 1.5) return "medium";
            return "low";
        })();

        const onTimePct = (() => {
            const ok = routes.filter((r) => r.delay_pct <= 0.1).length;
            return routes.length ? (ok / routes.length) * 100 : 0;
        })();

        const maxDelay = routes.reduce((m, r) => Math.max(m, r.delay_pct), 0) * 100;
        const avgStopsPerRoute = routes.length ? totalStops / routes.length : 0;

        const filtered = vehicleFilter ? routes.filter((x) => String(x.vehicle).toLowerCase().includes(vehicleFilter.toLowerCase())) : routes;
        return {
            routes,
            totalDistance,
            totalFuel,
            totalCost,
            totalFuelStations,
            totalRepairShops,
            onTimePct,
            maxDelay,
            avgStopsPerRoute,
            filtered,
            // expose avgEcoScore so UI can surface it
            avgEcoScore,
        };
    }, [refined, depot, vehicleFilter]);

    // ---------- Amenity / fuel/repair derived metrics (non-invasive) ----------
    const amenityKpis = useMemo(() => {
        // haversine (km)
        const haversineKm = (aLat, aLon, bLat, bLon) => {
            const R = 6371;
            const toRad = (d) => (d * Math.PI) / 180;
            const dLat = toRad(bLat - aLat);
            const dLon = toRad(bLon - aLon);
            const lat1 = toRad(aLat);
            const lat2 = toRad(bLat);
            const sinDLat = Math.sin(dLat / 2);
            const sinDLon = Math.sin(dLon / 2);
            const a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon;
            return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        };

        // assumed driving speed for ETA calculations (km/h)
        const ASSUMED_SPEED_KMPH = 50;
        const AVG_COST_PER_KM = 0.8; // £ per km for contingency estimate
        const HOURLY_DELAY_COST = 30; // £ per hour delay cost estimate

        const routeMetrics = (route) => {
            const seq = route.sequence || [];
            const fuelDists = []; // distances from stop -> nearest petrol
            const repairDists = [];
            const stationSet = new Set();
            const repairSet = new Set();

            // For finding next station candidate (nearest overall to route position)
            let bestStation = null;
            let bestStationDist = Infinity;

            for (const stop of seq) {
                if (!stop || typeof stop.lat !== "number" || typeof stop.lon !== "number") continue;

                // petrol
                if (Array.isArray(stop.nearby_petrol_stations) && stop.nearby_petrol_stations.length) {
                    let nearest = Infinity;
                    for (const s of stop.nearby_petrol_stations) {
                        if (s && typeof s.lat === "number" && typeof s.lon === "number") {
                            const d = haversineKm(stop.lat, stop.lon, s.lat, s.lon);
                            if (d < nearest) nearest = d;
                            stationSet.add(`${s.lat}:${s.lon}`);
                            // consider as global candidate
                            if (d < bestStationDist) {
                                bestStationDist = d;
                                bestStation = { lat: s.lat, lon: s.lon, name: s.name ?? s.id ?? "station" };
                            }
                        }
                    }
                    if (nearest !== Infinity) fuelDists.push(nearest);
                }

                // repair
                if (Array.isArray(stop.nearby_repair_shops) && stop.nearby_repair_shops.length) {
                    let nearestR = Infinity;
                    for (const r of stop.nearby_repair_shops) {
                        if (r && typeof r.lat === "number" && typeof r.lon === "number") {
                            const d = haversineKm(stop.lat, stop.lon, r.lat, r.lon);
                            if (d < nearestR) nearestR = d;
                            repairSet.add(`${r.lat}:${r.lon}`);
                        }
                    }
                    if (nearestR !== Infinity) repairDists.push(nearestR);
                }
            }

            const median = (arr) => {
                if (!arr.length) return null;
                const a = [...arr].sort((x, y) => x - y);
                const m = Math.floor(a.length / 2);
                return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
            };
            const pctWithin = (arr, km) => (arr.length ? (arr.filter((d) => d <= km).length / arr.length) * 100 : 0);

            const medFuel = median(fuelDists);
            const maxFuel = fuelDists.length ? Math.max(...fuelDists) : null;
            const medRepair = median(repairDists);
            const maxRepair = repairDists.length ? Math.max(...repairDists) : null;

            // consumption L/km (use route.fuel_l / distance_km when available)
            const consumption = route.distance_km > 0 ? (route.fuel_l / route.distance_km) : null;
            // fuel remaining if provided; fallback to null
            const fuelRemaining = Number(route.metrics?.fuel_remaining_l ?? route.metrics?.remaining_fuel_l ?? NaN);
            const fuelCapacity = Number(route.metrics?.fuel_capacity_l ?? NaN);

            // estimate remaining range if possible
            let estimatedKmRemaining = null;
            if (!isNaN(fuelRemaining) && consumption && consumption > 0) {
                estimatedKmRemaining = fuelRemaining / consumption;
            } else if (!isNaN(fuelCapacity) && !isNaN(route.fuel_l) && consumption && consumption > 0) {
                // assume fuel_l is used so far, capacity available
                const rem = fuelCapacity - route.fuel_l;
                if (rem > 0) estimatedKmRemaining = rem / consumption;
            } else {
                // can't estimate reliably
                estimatedKmRemaining = null;
            }

            // simple heuristic fuelRisk (0 = low risk, 100 = high risk)
            // factors: median fuel distance (larger -> higher risk), fuel_used (higher -> higher risk), pct stops within 1km (lower -> higher risk), estimated remaining range (lower -> higher risk)
            const fuelUsed = Number(route.fuel_l || 0);
            const pctWithin1 = pctWithin(fuelDists, 1);
            let risk = 0;
            if (medFuel != null) risk += Math.min(50, medFuel * 10); // medFuel 0 => 0, 5km => 50
            risk += Math.min(25, fuelUsed * 8); // weight fuel used
            if (pctWithin1 < 50) risk += 15;
            if (estimatedKmRemaining != null) {
                if (estimatedKmRemaining < 20) risk += 20;
                else if (estimatedKmRemaining < 50) risk += 10;
            } else {
                // uncertainty penalty
                risk += 5;
            }
            risk = Math.round(Math.max(0, Math.min(100, risk)));

            // Refuel urgency: use bestStationDist and estimatedKmRemaining to create ETA and a label
            let nextStation = null;
            let nextStationEtaMin = null;
            if (bestStation && bestStationDist !== Infinity) {
                nextStation = { ...bestStation, distance_km: Number(bestStationDist.toFixed(2)) };
                if (estimatedKmRemaining != null && consumption && consumption > 0) {
                    // detour cost is approximated by bestStationDist (distance from stop) -> use assumed speed
                    nextStationEtaMin = Math.round((bestStationDist / ASSUMED_SPEED_KMPH) * 60);
                } else {
                    nextStationEtaMin = Math.round((bestStationDist / ASSUMED_SPEED_KMPH) * 60);
                }
            }

            // Repair coverage: percent of stops with a repair within 10km, redundancy (# unique repair shops within 10km measured across stops)
            const stopsWithRepair10 = repairDists.filter((d) => d <= 10).length;
            const repairCoveragePct = seq.length ? Math.round((stopsWithRepair10 / seq.length) * 100) : 0;
            const redundancyWithin10km = (() => {
                return repairSet.size || 0;
            })();

            // data confidence / freshness
            const stationCount = stationSet.size;
            const repairCount = repairSet.size;
            const dataConfidence = {
                petrol: stationCount >= 4 ? "rich" : stationCount >= 2 ? "ok" : "sparse",
                repairs: repairCount >= 4 ? "rich" : repairCount >= 2 ? "ok" : "sparse",
            };

            // per-stop contingency cost: estimate based on distance to depot (if depot present) or median repair distance
            let perStopContingencyEstimate = null;
            if (depot && typeof depot.lat === "number" && typeof depot.lon === "number") {
                // estimate average distance from stops to depot
                const depotDists = [];
                for (const stop of seq) {
                    if (!stop || typeof stop.lat !== "number" || typeof stop.lon !== "number") continue;
                    depotDists.push(haversineKm(stop.lat, stop.lon, depot.lat, depot.lon));
                }
                const avgDepotDist = depotDists.length ? depotDists.reduce((a, b) => a + b, 0) / depotDists.length : null;
                if (avgDepotDist != null) {
                    const hours = avgDepotDist / ASSUMED_SPEED_KMPH;
                    perStopContingencyEstimate = Math.round((avgDepotDist * AVG_COST_PER_KM + hours * HOURLY_DELAY_COST) * 100) / 100;
                }
            } else if (medRepair != null) {
                const hours = medRepair / ASSUMED_SPEED_KMPH;
                perStopContingencyEstimate = Math.round((medRepair * AVG_COST_PER_KM + hours * HOURLY_DELAY_COST) * 100) / 100;
            } else {
                perStopContingencyEstimate = null;
            }

            // aggregate operational ratios
            const fuelPerKm = route.distance_km > 0 ? Number((route.fuel_l / route.distance_km).toFixed(4)) : null;
            const costPerKm = route.distance_km > 0 ? Number((route.fuel_cost / route.distance_km).toFixed(4)) : null;
            const costPerStop = route.stops > 0 ? Number((route.fuel_cost / (route.stops || 1)).toFixed(2)) : null;
            // stops per hour using normal_secs if available else estimate from distance
            const totalHours = route.normal_secs ? route.normal_secs / 3600 : (route.distance_km / 40); // fallback average speed 40km/h
            const stopsPerHour = totalHours > 0 ? Number((route.stops / totalHours).toFixed(2)) : null;

            // driver workload index: heuristic combining stopsPerHour, totalHours and stops
            let workloadIndex = null;
            if (stopsPerHour != null && totalHours != null) {
                const s = Math.min(50, stopsPerHour * 5); // normalize
                const t = Math.min(30, totalHours * 2); // normalize
                const st = Math.min(20, route.stops * 0.5);
                workloadIndex = Math.round(Math.min(100, s + t + st));
            }

            return {
                vehicle: route.vehicle,
                medianFuelKm: medFuel != null ? Number(medFuel.toFixed(2)) : null,
                maxFuelKm: maxFuel != null ? Number(maxFuel.toFixed(2)) : null,
                pctStopsWithin1kmFuel: Math.round(pctWithin(fuelDists, 1)),
                pctStopsWithin3kmFuel: Math.round(pctWithin(fuelDists, 3)),
                medianRepairKm: medRepair != null ? Number(medRepair.toFixed(2)) : null,
                maxRepairKm: maxRepair != null ? Number(maxRepair.toFixed(2)) : null,
                stationCount,
                repairCount,
                fuelUsedL: Math.round((route.fuel_l || 0) * 100) / 100,
                fuelRiskScore: risk,
                dataConfidence,
                nextStation,
                nextStationEtaMin,
                repairCoveragePct,
                redundancyWithin10km,
                perStopContingencyEstimate,
                fuelPerKm,
                costPerKm,
                costPerStop,
                stopsPerHour,
                workloadIndex,
            };
        };

        const all = (refined || []).map(routeMetrics);

        // aggregated summary across all routes (median of medians, avg risk)
        const medians = all.map((r) => r.medianFuelKm).filter((v) => v != null);
        const aggMedianFuelKm = medians.length ? medians.reduce((a, b) => a + b, 0) / medians.length : null;
        const avgRisk = all.length ? Math.round(all.reduce((a, b) => a + (b.fuelRiskScore || 0), 0) / all.length) : 0;
        const totalStations = all.reduce((s, r) => s + (r.stationCount || 0), 0);
        const totalRepairs = all.reduce((s, r) => s + (r.repairCount || 0), 0);

        // coarse overall confidence
        const overallConfidence = {
            petrol: totalStations >= 4 ? "rich" : totalStations >= 2 ? "ok" : "sparse",
            repairs: totalRepairs >= 4 ? "rich" : totalRepairs >= 2 ? "ok" : "sparse",
        };

        return {
            perRoute: all,
            aggMedianFuelKm: aggMedianFuelKm != null ? Number(aggMedianFuelKm.toFixed(2)) : null,
            avgFuelRiskScore: avgRisk,
            totalStations,
            totalRepairs,
            overallConfidence,
        };
    }, [refined, depot]);

    const activeVsIdleData = useMemo(
        () => [{ name: "Active", value: baseKpis.activeVehicles }, { name: "Idle", value: baseKpis.idleVehicles }],
        [baseKpis.activeVehicles, baseKpis.idleVehicles]
    );

    const distanceVsFuelGenAI = useMemo(
        () => genaiKpis.filtered.map((r) => ({ x: r.distance_km, y: r.fuel_l, label: r.vehicle })),
        [genaiKpis.filtered]
    );

    const fuelVsRepairByRoute = useMemo(
        () => genaiKpis.filtered.map((r) => ({ vehicle: r.vehicle, fuelStations: r.fuelStations, repairShops: r.repairShops })),
        [genaiKpis.filtered]
    );

    const ecoDistribution = useMemo(() => {
        const counts = { high: 0, medium: 0, low: 0, na: 0 };
        genaiKpis.filtered.forEach((r) => {
            const s = (r.eco_score || "").toLowerCase();
            if (["high", "medium", "low"].includes(s)) counts[s] += 1;
            else counts.na += 1;
        });
        return [
            { name: "High", value: counts.high },
            { name: "Medium", value: counts.medium },
            { name: "Low", value: counts.low },
            { name: "N/A", value: counts.na },
        ];
    }, [genaiKpis.filtered]);

    const trafficCounts = useMemo(() => {
        const m = new Map();
        genaiKpis.filtered.forEach((r) => m.set(r.traffic_level, (m.get(r.traffic_level) || 0) + 1));
        return Array.from(m.entries()).map(([level, count]) => ({ level, count }));
    }, [genaiKpis.filtered]);

    const stopsVsDistance = useMemo(() => genaiKpis.filtered.map((r) => ({ stops: r.stops, distance: r.distance_km, vehicle: r.vehicle })), [genaiKpis.filtered]);

    // ---- map navigation ----
    const handleShowMap = () => {
        if (typeof onShowMap === "function") return onShowMap();
        if (typeof window !== "undefined") window.location.href = "/map";
    };

    /* ===================== Now safe to early return (UI placeholders) ===================== */
    if (loading) {
        return <div className="p-6 text-center text-gray-600">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">Error: {error}</div>;
    }

    if (!data) {
        return <div className="p-6 text-center text-gray-600">No route data available</div>;
    }

    /* ===================== Main JSX (modified to surface the requested metrics) ===================== */
    return (
        <div className="w-full p-4 md:p-6 space-y-6" style={{ background: theme.bg }}>
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-2" style={{ color: theme.text }}>
                        <Layers className="w-6 h-6" /> VRP Fleet Dashboard
                    </h1>
                    <p className="text-sm mt-1" style={{ color: theme.textMuted }}>
                        Unified view of Base AI Optimization (OR-Tools) and GenAI Computation (Refined Routes).
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Input placeholder="Filter by Vehicle (e.g., 2 or V2)" value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)} className="w-56" />
                    <Button onClick={handleShowMap} className="gap-2">
                        <MapIcon className="w-4 h-4" /> Show Map
                    </Button>
                </div>
            </div>

            {/* Depot Card */}
            <Card className="rounded-2xl shadow-sm">
                <CardContent className="p-4 md:p-6">
                    <div className="flex flex-wrap items-center gap-4">
                        <Badge variant="secondary" className="text-xs">Depot</Badge>
                        <div className="flex items-center gap-2" style={{ color: theme.text }}>
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{depot?.id}</span>
                        </div>
                        <div className="text-sm" style={{ color: theme.textMuted }}>Lat: {depot?.lat}, Lon: {depot?.lon}</div>
                        <div className="ml-auto flex items-center gap-3 text-sm" style={{ color: theme.text }}>
                            <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> OR-Tools Vehicles: <strong>{baseKpis.totalVehicles}</strong></span>
                            

                            {/* ADDED: aggregated amenity metrics (non-invasive) */}
                            {amenityKpis?.aggMedianFuelKm != null && (
                                <span className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
                                    • Median fuel dist: <strong style={{ color: theme.text }}>{amenityKpis.aggMedianFuelKm} km</strong>
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
                                • Fuel risk:{" "}
                                <Badge
                                    style={{
                                        background:
                                            (amenityKpis?.avgFuelRiskScore ?? 0) > 65
                                                ? theme.chart.red500
                                                : (amenityKpis?.avgFuelRiskScore ?? 0) > 35
                                                    ? theme.chart.amber500
                                                    : theme.chart.green500,
                                        color: "#fff",
                                        padding: "0 6px",
                                        fontSize: "11px",
                                    }}
                                >
                                    {amenityKpis?.avgFuelRiskScore ?? "—"}
                                </Badge>
                            </span>

                            <span className="flex items-center gap-1 text-xs" style={{ color: theme.textMuted }}>
                                • Station data:{" "}
                                <Badge
                                    variant="secondary"
                                    style={{
                                        background:
                                            amenityKpis?.overallConfidence?.petrol === "sparse"
                                                ? theme.chart.red500
                                                : amenityKpis?.overallConfidence?.petrol === "ok"
                                                    ? theme.chart.amber500
                                                    : theme.chart.green500,
                                        color: "#fff",
                                        padding: "0 6px",
                                        fontSize: "11px",
                                    }}
                                >
                                    {amenityKpis?.overallConfidence?.petrol ?? "unknown"}
                                </Badge>
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="base" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="base" className="flex items-center gap-2">
                        <Cog className="w-4 h-4" /> Base AI Optimization (OR-Tools)
                    </TabsTrigger>
                    <TabsTrigger value="genai" className="flex items-center gap-2">
                        <Brain className="w-4 h-4" /> GenAI Computation (Refined Routes)
                    </TabsTrigger>
                </TabsList>

                {/* BASE content */}
                <TabsContent value="base" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <KpiCard icon={<Truck />} label="Active Vehicles" value={baseKpis.activeVehicles} sub={`${baseKpis.totalVehicles} total`} />
                        <KpiCard icon={<Gauge />} label="Total Distance" value={`${baseKpis.totalDistance.toFixed(3)} km`} sub="Sum of all OR-Tools routes" />
                        <KpiCard icon={<Fuel />} label="Fuel Used" value={`${baseKpis.totalFuelUsed.toFixed(2)} L`} sub="Reported by solver" />
                        <KpiCard icon={<Clock3 />} label="Total Load" value={baseKpis.totalLoad.toFixed(2)} sub="Aggregate across vehicles" />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Active vs Idle Vehicles</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={activeVsIdleData} dataKey="value" nameKey="name" outerRadius={90} label>
                                                {activeVsIdleData.map((entry, idx) => <Cell key={`slice-${idx}`} fill={idx === 0 ? theme.chart.blue600 : theme.chart.blue300} />)}
                                            </Pie>
                                            <Tooltip wrapperStyle={{ borderColor: theme.border }} />
                                            <Legend formatter={(v) => <span style={{ color: theme.text }}>{v}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Distance & Fuel by Vehicle</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={baseKpis.filteredByVehicle}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                                            <XAxis dataKey="vehicle_id" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <YAxis yAxisId="left" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <YAxis yAxisId="right" orientation="right" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <Tooltip wrapperStyle={{ borderColor: theme.border }} />
                                            <Legend formatter={(v) => <span style={{ color: theme.text }}>{v}</span>} />
                                            <Bar yAxisId="left" dataKey="distance_km" name="Distance (km)" fill={theme.chart.teal500} />
                                            <Bar yAxisId="right" dataKey="fuel_l" name="Fuel (L)" fill={theme.chart.blue600} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-2xl">
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead style={{ background: theme.surfaceMuted }}>
                                    <tr>
                                        <Th>Vehicle ID</Th>
                                        <Th>Stops</Th>
                                        <Th>Load</Th>
                                        <Th>Distance (km)</Th>
                                        <Th>Fuel (L)</Th>
                                        <Th>Fuel Cost</Th>
                                        <Th>Status</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {baseKpis.filteredByVehicle.map((v) => (
                                        <tr key={v.vehicle_id} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                            <Td>{v.vehicle_id}</Td>
                                            <Td>{v.stops}</Td>
                                            <Td>{v.load.toFixed(2)}</Td>
                                            <Td>{v.distance_km.toFixed(3)}</Td>
                                            <Td>{v.fuel_l.toFixed(2)}</Td>
                                            <Td>{v.fuel_cost.toFixed(2)}</Td>
                                            <Td>{v.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Idle</Badge>}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* GENAI content with new amenity & risk UI */}
                <TabsContent value="genai" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* show avg eco as a KPI (we now use avgEcoScore from genaiKpis) */}
                        <KpiCard icon={<Activity />} label="Avg Eco" value={genaiKpis.avgEcoScore ? genaiKpis.avgEcoScore.toUpperCase() : "N/A"} sub="Aggregated eco score" />
                        <KpiCard icon={<Gauge />} label="Total Distance" value={`${genaiKpis.totalDistance.toFixed(3)} km`} sub="Sum across routes" />
                        <KpiCard icon={<Fuel />} label="Fuel Used" value={`${genaiKpis.totalFuel.toFixed(2)} L`} sub="From metrics" />
                        <KpiCard icon={<Fuel />} label="Fuel Cost" value={`£${genaiKpis.totalCost.toFixed(2)}`} sub="From metrics" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <KpiCard icon={<FuelIcon />} label="Fuel Stations (in routes)" value={genaiKpis.totalFuelStations} sub="Sum across sequences" />
                        <KpiCard icon={<Wrench />} label="Repair Shops (in routes)" value={genaiKpis.totalRepairShops} sub="Sum across sequences" />
                        <KpiCard icon={<Clock3 />} label="Avg Stops / Route" value={genaiKpis.avgStopsPerRoute.toFixed(1)} sub="Excluding depot" />
                    </div>

                    {/* NEW: Amenity & Risk Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Amenity & Risk — Summary</h3>
                                <div className="text-sm" style={{ color: theme.textMuted }}>
                                    <div>Median distance to fuel (agg): <strong style={{ color: theme.text }}>{amenityKpis.aggMedianFuelKm ?? "—"} km</strong></div>
                                    <div className="mt-2">Avg fuel risk:{" "}
                                        <Badge style={{
                                            background: (amenityKpis.avgFuelRiskScore ?? 0) > 65 ? theme.chart.red500 : (amenityKpis.avgFuelRiskScore ?? 0) > 35 ? theme.chart.amber500 : theme.chart.green500,
                                            color: "#fff",
                                            padding: "0 6px",
                                            fontSize: "11px",
                                        }}>
                                            {amenityKpis.avgFuelRiskScore ?? "—"}
                                        </Badge>
                                    </div>
                                    <div className="mt-2">Station data: <strong style={{ color: theme.text }}>{amenityKpis.totalStations}</strong>, Repair data: <strong style={{ color: theme.text }}>{amenityKpis.totalRepairs}</strong></div>
                                    <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
                                        Note: counts alone can be misleading — we show median/max distances, % within thresholds, and data confidence.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Repair Coverage & Redundancy</h3>
                                <div className="text-sm" style={{ color: theme.textMuted }}>
                                    <div>Overall repair coverage: <strong style={{ color: theme.text }}>{amenityKpis.totalRepairs}</strong></div>
                                    <div className="mt-2">Confidence: <strong style={{ color: theme.text }}>{amenityKpis.overallConfidence.repairs}</strong></div>
                                    <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
                                        Repair Coverage Index = % stops within 10km of a repair shop (per-route shown below). Low values → high tow risk.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Operational Ratios</h3>
                                <div className="text-sm" style={{ color: theme.textMuted }}>
                                    <div>Fleet fuel / km (approx): <strong style={{ color: theme.text }}>{(genaiKpis.totalDistance > 0 ? (genaiKpis.totalFuel / genaiKpis.totalDistance).toFixed(4) : "—")} L/km</strong></div>
                                    <div className="mt-2">Avg cost / km: <strong style={{ color: theme.text }}>{(genaiKpis.totalDistance > 0 ? (genaiKpis.totalCost / genaiKpis.totalDistance).toFixed(4) : "—")} £/km</strong></div>
                                    <div className="mt-2 text-xs" style={{ color: theme.textMuted }}>
                                        These normalized metrics are more actionable than raw counts when deciding route reassignments or refuel priorities.
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* NEW: Per-route amenity table (median/max, % within 1/3km, fuel risk, next station ETA, redundancy, workload) */}
                    <Card className="rounded-2xl">
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead style={{ background: theme.surfaceMuted }}>
                                    <tr>
                                        <Th>Vehicle</Th>
                                        <Th>Median fuel (km)</Th>
                                        <Th>Max repair (km)</Th>
                                        <Th>% stops ≤1km fuel</Th>
                                        <Th>Fuel risk</Th>
                                        <Th>Repair cov. %</Th>
                                        <Th>Repair redundancy</Th>
                                        <Th>Contingency £/stop</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {amenityKpis.perRoute.map((r) => (
                                        <tr key={r.vehicle} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                            <Td>{r.vehicle}</Td>
                                            <Td>{r.medianFuelKm != null ? `${r.medianFuelKm}` : "—"}</Td>
                                            <Td>{r.maxRepairKm != null ? `${r.maxRepairKm}` : "—"}</Td>
                                            <Td>{typeof r.pctStopsWithin1kmFuel === "number" ? `${r.pctStopsWithin1kmFuel}%` : "—"}</Td>
                                            <Td>
                                                <Badge style={{
                                                    background: r.fuelRiskScore > 65 ? theme.chart.red500 : r.fuelRiskScore > 35 ? theme.chart.amber500 : theme.chart.green500,
                                                    color: "#fff",
                                                    padding: "0 8px",
                                                    fontSize: "11px",
                                                }}>
                                                    {r.fuelRiskScore}
                                                </Badge>
                                            </Td>
                    
                                            <Td>{typeof r.repairCoveragePct === "number" ? `${r.repairCoveragePct}%` : "—"}</Td>
                                            <Td>{r.redundancyWithin10km != null ? r.redundancyWithin10km : "—"}</Td>
                                            <Td>{r.perStopContingencyEstimate != null ? `£${r.perStopContingencyEstimate}` : "—"}</Td>
            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>

                    {/* keep the other genai visuals */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Normal vs Traffic Duration (per Route)</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={genaiKpis.filtered.map((r) => ({
                                                route: r.vehicle,
                                                normal_mins: r.normal_secs / 60,
                                                traffic_mins: r.traffic_secs / 60,
                                            }))}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                                            <XAxis dataKey="route" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <YAxis tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <Tooltip wrapperStyle={{ borderColor: theme.border }} />
                                            <Legend formatter={(v) => <span style={{ color: theme.text }}>{v}</span>} />
                                            <Bar dataKey="normal_mins" name="Normal (mins)" fill={theme.chart.green500} />
                                            <Bar dataKey="traffic_mins" name="Traffic (mins)" fill={theme.chart.amber500} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Fuel vs Distance (Efficiency Curve)</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                                            <XAxis type="number" dataKey="x" name="Distance (km)" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <YAxis type="number" dataKey="y" name="Fuel (L)" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <Tooltip wrapperStyle={{ borderColor: theme.border }} />
                                            <Legend formatter={(v) => <span style={{ color: theme.text }}>{v}</span>} />
                                            <Scatter name="Routes" data={distanceVsFuelGenAI} fill={theme.chart.blue600} />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* support charts, tables, etc. (kept same) */}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Fuel Stations & Repair Shops (per Route)</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={fuelVsRepairByRoute}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                                            <XAxis dataKey="vehicle" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <YAxis tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <Tooltip wrapperStyle={{ borderColor: theme.border }} />
                                            <Legend formatter={(v) => <span style={{ color: theme.text }}>{v}</span>} />
                                            <Bar dataKey="fuelStations" name="Fuel Stations" fill={theme.chart.blue600} />
                                            <Bar dataKey="repairShops" name="Repair Shops" fill={theme.chart.purple500} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Eco Score Distribution</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie dataKey="value" data={ecoDistribution} nameKey="name" outerRadius={90} label>
                                                {ecoDistribution.map((_, i) => <Cell key={i} fill={[theme.chart.green500, theme.chart.amber500, theme.chart.red500, theme.chart.slate500][i % 4]} />)}
                                            </Pie>
                                            <Tooltip wrapperStyle={{ borderColor: theme.border }} />
                                            <Legend formatter={(v) => <span style={{ color: theme.text }}>{v}</span>} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Traffic Level (count of routes)</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={trafficCounts}>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                                            <XAxis dataKey="level" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <YAxis allowDecimals={false} tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <Tooltip wrapperStyle={{ borderColor: theme.border }} />
                                            <Legend formatter={(v) => <span style={{ color: theme.text }}>{v}</span>} />
                                            <Bar dataKey="count" name="Routes" fill={theme.chart.blue400} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-2xl" tone="muted">
                            <CardContent className="p-4 md:p-6 space-y-3">
                                <h3 className="font-semibold" style={{ color: theme.text }}>Stops vs Distance</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ScatterChart>
                                            <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                                            <XAxis type="number" dataKey="stops" name="Stops" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <YAxis type="number" dataKey="distance" name="Distance (km)" tick={{ fill: theme.text }} axisLine={{ stroke: theme.border }} tickLine={{ stroke: theme.border }} />
                                            <Tooltip wrapperStyle={{ borderColor: theme.border }} />
                                            <Legend formatter={(v) => <span style={{ color: theme.text }}>{v}</span>} />
                                            <Scatter name="Routes" data={stopsVsDistance} fill={theme.chart.teal400} />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="rounded-2xl">
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead style={{ background: theme.surfaceMuted }}>
                                    <tr>
                                        <Th>Vehicle</Th>
                                        <Th>Stops</Th>
                                        <Th>Distance (km)</Th>
                                        <Th>Fuel (L)</Th>
                                        <Th>Fuel Cost</Th>
                                        <Th>Eco</Th>
                                        <Th>Traffic Level</Th>
                                        <Th>Road</Th>
                                        <Th>Delay %</Th>
                                        <Th>Fuel Stations</Th>
                                        <Th>Repair Shops</Th>
                                        <Th>Notes</Th>
                                        <Th>Fuel L/km</Th>
                                        <Th>Workload</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {genaiKpis.filtered.map((r) => (
                                        <tr key={r.vehicle} style={{ borderBottom: `1px solid ${theme.border}` }}>
                                            <Td>{r.vehicle}</Td>
                                            <Td>{r.stops}</Td>
                                            <Td>{r.distance_km.toFixed(3)}</Td>
                                            <Td>{r.fuel_l.toFixed(2)}</Td>
                                            <Td>£{r.fuel_cost.toFixed(2)}</Td>
                                            <Td><EcoBadge score={r.eco_score} /></Td>
                                            <Td>{r.traffic_level}</Td>
                                            <Td>{r.road_condition}</Td>
                                            <Td>{(r.delay_pct * 100).toFixed(1)}%</Td>
                                            <Td>{r.fuelStations}</Td>
                                            <Td>{r.repairShops}</Td>
                                            <Td className="max-w-[280px] truncate" title={r.notes}>{r.notes}</Td>
                                            <Td>{r.fuelPerKm != null ? r.fuelPerKm.toFixed ? r.fuelPerKm.toFixed(4) : r.fuelPerKm : "—"}</Td>
                                            <Td>{r.workloadIndex != null ? `${r.workloadIndex}` : "—"}</Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Route flowchart */}
            <Card className="rounded-2xl" tone="muted">
                <CardContent className="p-4 md:p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Workflow className="w-4 h-4" />
                        <h3 className="font-semibold" style={{ color: theme.text }}>Route per Vehicle – Flowchart</h3>
                    </div>

                    <div className="space-y-4">
                        {genaiKpis.routes.map((r) => (
                            <div key={r.vehicle} className="border rounded-xl p-3" style={{ borderColor: theme.border, background: theme.surface }}>
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2 text-sm" style={{ color: theme.text }}>
                                        <Truck className="w-4 h-4" /> <span className="font-medium">{r.vehicle}</span>
                                    </div>
                                    <Badge variant="secondary">{r.sequence.length} hops</Badge>
                                </div>
                                <HorizontalFlow items={(r.sequence || []).map((s) => s?.id || "?")} />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Situational Assistants */}
            <Card className="rounded-2xl" tone="muted">
                <CardContent className="p-4 md:p-6 space-y-6">
                    <div className="flex items-center gap-2">
                        <Bot className="w-4 h-4" />
                        <h3 className="font-semibold" style={{ color: theme.text }}>Situational Assistants</h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <SituationChat title="Vehicle Breakage" type="vehicle_breakage" tripId={trip_id} />
                        <SituationChat title="Fuel Management" type="fuel_management" tripId={trip_id} />
                        <SituationChat title="Fatigue" type="fatigue" tripId={trip_id} />
                    </div>


                </CardContent>
            </Card>

            <div className="text-xs" style={{ color: theme.textMuted }}>
                * Base AI Optimization = OR-Tools outputs; GenAI Computation = refined_routes metrics enrichments (incl. fuel/repair availability).
            </div>
        </div>
    );
}

/* ----------------- UI Subcomponents (unchanged) ----------------- */
function KpiCard({ icon, label, value, sub }) {
    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="rounded-2xl">
                <CardContent className="p-4 md:p-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl border" style={{ background: theme.chip, borderColor: theme.border, color: theme.text }}>
                            {React.cloneElement(icon, { className: "w-5 h-5" })}
                        </div>
                        <div>
                            <div className="text-xs uppercase tracking-wide" style={{ color: theme.textMuted }}>{label}</div>
                            <div className="text-xl font-semibold leading-tight" style={{ color: theme.text }}>{value}</div>
                            {sub && <div className="text-xs mt-1" style={{ color: theme.textMuted }}>{sub}</div>}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}

function EcoBadge({ score }) {
    const s = String(score || "").toLowerCase();
    if (!s) return <Badge variant="secondary">n/a</Badge>;
    if (s === "high") return <Badge style={{ background: theme.chart.green500, color: "#fff" }}>high</Badge>;
    if (s === "medium") return <Badge style={{ background: theme.chart.amber500, color: "#fff" }}>medium</Badge>;
    return <Badge style={{ background: theme.chart.red500, color: "#fff" }}>low</Badge>;
}

function Th({ children }) {
    return (
        <th className="text-left font-medium text-xs uppercase tracking-wide py-2 px-3" style={{ color: theme.textMuted }}>
            {children}
        </th>
    );
}
function Td({ children }) {
    return <td className="py-2 px-3 align-top" style={{ color: theme.text }}>{children}</td>;
}

function HorizontalFlow({ items = [] }) {
    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
            {items.map((label, idx) => (
                <React.Fragment key={idx}>
                    <div className="shrink-0 px-3 py-1.5 rounded-full border text-xs font-medium" style={{ background: theme.surface, borderColor: theme.border, color: theme.text }}>{label}</div>
                    {idx < items.length - 1 && (
                        <svg width="30" height="16" viewBox="0 0 30 16" className="shrink-0">
                            <path d="M0 8 H24" stroke="currentColor" strokeWidth="2" fill="none" />
                            <path d="M24 3 L30 8 L24 13 Z" fill="currentColor" />
                        </svg>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
}


// call backend to get recommendation for a situation
// Helper: pick endpoint by type and POST payload with JWT (if present)
async function fetchRecommendationForType({ type, tripId, payload, timeoutMs = 10000 }) {
  if (!tripId) throw new Error("tripId required for backend recommendation");

  // map frontend types to backend URLs
  const endpointMap = {
    vehicle_breakage: `/api/situation/recommend/${tripId}`,
    fuel_management: `/api/situation/fuel/${tripId}`,
    fatigue: `/api/situation/fatigue/${tripId}`,
  };

  const path = endpointMap[type];
  if (!path) throw new Error("Unknown situation type: " + type);

  const token = sessionStorage.getItem("token");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`http://127.0.0.1:5000${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // try to parse JSON (and give helpful diagnostics if not JSON)
    const json = await res.json().catch(async () => {
      const text = await res.text().catch(() => "<unreadable response body>");
      throw new Error(`Invalid JSON response from server: ${text}`);
    });

    if (!res.ok) {
      const msg = json?.message || json?.error || `Server error ${res.status}`;
      throw new Error(msg);
    }

    // backend returns varying shapes but all include status + recommendation or latest_reply
    return json;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}


/* SituationChat - single unified implementation
   - Prefers onAsk(payload) if provided by parent
   - Otherwise calls fetchRecommendationForType({type, tripId, payload})
   - Falls back to localRecommender on any error
*/
/* SituationChat - single unified implementation with consecutive-message dedupe */
/* SituationChat - single unified implementation with robust dedupe/merge */
function SituationChat({ title, type, onAsk, tripId = null }) {
  const [vehicleId, setVehicleId] = useState("");
  const [nearbyCustomerId, setNearbyCustomerId] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]); // array of { role, content }
  const [lastResponse, setLastResponse] = useState(null);

  // helper: append entry but avoid consecutive duplicate entries (same role + content)
  const appendEntry = (entry) => {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.role === entry.role && normalizeText(last.content) === normalizeText(entry.content)) return prev;
      return [...prev, entry];
    });
  };

  // normalise text for comparison (trim + collapse whitespace)
  const normalizeText = (s) => String(s ?? "").trim().replace(/\s+/g, " ");

  // helper: collapse consecutive identical messages in an array (role + normalized content)
  const collapseConsecutive = (arr) => {
    const out = [];
    for (const m of arr) {
      const role = m.role ?? "assistant";
      const content = String(m.content ?? m);
      const normalizedContent = normalizeText(content);
      const last = out[out.length - 1];
      if (last && last.role === role && normalizeText(last.content) === normalizedContent) continue;
      out.push({ role, content });
    }
    return out;
  };

  // helper: merge existing history with incoming conversation (avoid duplicates)
  const mergeAndCollapse = (existing, incoming) => {
    // convert incoming to normalized objects
    const incomingNorm = incoming.map((m) =>
      m && typeof m === "object" && m.role && m.content ? { role: m.role, content: String(m.content) } : { role: "assistant", content: String(m) }
    );

    // If incoming starts with the same sequence as existing tail, avoid re-adding duplicates:
    // We'll simply concat and run collapseConsecutive to drop consecutive duplicates.
    const merged = [...existing, ...incomingNorm];
    return collapseConsecutive(merged);
  };

  const handleAsk = async () => {
    if (!userMessage?.trim()) return;

    const payload = {
      type,
      vehicle_id: vehicleId || null,
      near_customer: nearbyCustomerId || null,
      user_message: userMessage || "",
    };

    setLoading(true);

    try {
      // prefer parent-provided onAsk (useful for tests/mocks)
      let backendJson = null;
      if (typeof onAsk === "function") {
        backendJson = await onAsk(payload);
      } else {
        // Use the shared helper that posts to the real backend.
        backendJson = await fetchRecommendationForType({ type, tripId, payload });
      }

      // Normalize conversation + recommendation fields (backend has many shapes)
      const conversation =
        backendJson?.conversation ||
        backendJson?.chat_history ||
        backendJson?.chat_history ||
        backendJson?.conversation ||
        [];

      const recommendationText =
        backendJson?.recommendation ||
        backendJson?.latest_reply ||
        backendJson?.note ||
        "(no recommendation returned)";

      if (Array.isArray(conversation) && conversation.length > 0) {
        // Merge incoming conversation with existing local history, then collapse duplicates
        setHistory((prev) => {
          const merged = mergeAndCollapse(prev, conversation);
          return merged;
        });
      } else {
        // Backend didn't return conversation array:
        // - append only assistant reply (user message is already implicitly shown)
        appendEntry({ role: "assistant", content: recommendationText });
      }

      // Keep a compact "lastResponse" record for UI if desired
      setLastResponse({
        status: backendJson?.status || "success",
        recommendation: recommendationText,
        vehicle_id: backendJson?.vehicle_id ?? vehicleId,
        near_customer: backendJson?.near_customer ?? nearbyCustomerId,
      });
    } catch (err) {
      console.warn("Recommendation fetch failed — using local fallback:", err);

      const recommendation = localRecommender({
        type,
        vehicleId: vehicleId || null,
        nearbyCustomerId: nearbyCustomerId || null,
      });

      // add user only if not already the last user entry
      appendEntry({ role: "user", content: userMessage });
      appendEntry({ role: "assistant", content: recommendation });

      setLastResponse({
        status: "fallback",
        recommendation,
        note: `Local fallback: ${err.message || "backend unavailable"}`,
        vehicle_id: vehicleId || null,
        near_customer: nearbyCustomerId || null,
      });
    } finally {
      setLoading(false);
      setUserMessage("");
    }
  };

  const renderMessage = (m, idx) => {
    const label = m.role === "user" ? "You" : "Assistant";
    return (
      <div key={idx} className="text-sm" style={{ color: theme.text }}>
        <span className="font-medium mr-1">{label}:</span>
        <span>{m.content}</span>
      </div>
    );
  };

  return (
    <div className="border rounded-2xl p-4 space-y-3" style={{ borderColor: theme.border, background: theme.surface }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2" style={{ color: theme.text }}>
          <Bot className="w-4 h-4" />
          <h4 className="font-medium">{title}</h4>
        </div>
        <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">{type}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Input placeholder="Vehicle ID (e.g., 2 or V2)" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} />
        <Input placeholder="Nearby Customer ID (e.g., C003)" value={nearbyCustomerId} onChange={(e) => setNearbyCustomerId(e.target.value)} />
      </div>

      <Textarea placeholder="Describe the situation / ask a question" value={userMessage} onChange={(e) => setUserMessage(e.target.value)} className="min-h-[80px]" />

      <div className="flex items-center justify-between gap-2">
        <div className="text-xs" style={{ color: theme.textMuted }}>Returns JSON: status, recommendation, conversation</div>
        <Button onClick={handleAsk} disabled={loading || !userMessage} className="gap-2" style={loading ? { opacity: 0.8 } : {}}>
          <Send className="w-4 h-4" /> {loading ? "Thinking..." : "Ask"}
        </Button>
      </div>

      {!!history.length && (
        <div className="mt-2 space-y-2 max-h-44 overflow-y-auto">
          {history.map((m, idx) => renderMessage(m, idx))}
        </div>
      )}

      {lastResponse && (
        <div className="rounded-xl p-3 text-xs" style={{ background: theme.surfaceMuted, border: `1px solid ${theme.border}` }}>
          <div><strong>Latest:</strong> {lastResponse.recommendation}</div>
          {lastResponse.note && <div className="mt-1 text-[11px] text-gray-600">Note: {lastResponse.note}</div>}
        </div>
      )}
    </div>
  );
}




function localRecommender({ type, vehicleId, nearbyCustomerId }) {
    const v = vehicleId || "unknown";
    const c = nearbyCustomerId || "nearest";
    const base = (steps) => `\n- ${steps.join("\n- ")}`;

    if (type === "vehicle_breakage") {
        return `Recommended actions for vehicle ${v} (near ${c}):` + base([
            "Pull over safely and turn on hazard lights",
            "Notify dispatcher; auto-assign nearest repair shop from sequence metadata if available",
            "Offer re-assignment of pending stops to closest active vehicles",
            "If drivable, proceed to depot or nearest repair shop; else request tow",
        ]);
    }
    if (type === "fuel_management") {
        return `Fuel guidance for vehicle ${v} (near ${c}):` + base([
            "Check remaining range vs next two hops",
            "Refuel at nearest partner station (from sequence metadata)",
            "Re-sequence low-priority stops if ETA risk > 10%",
        ]);
    }
    return `Fatigue mitigation for vehicle ${v} (near ${c}):` + base([
        "Insert a 15–20 minute break at a safe lay-by",
        "Offer driver swap if a standby vehicle is within 5 km",
        "Reduce max speed by 10% until next stop",
    ]);
}

const returnJsonTemplate = `return jsonify({\n    "status": "success",\n    "situation": user_message,\n    "recommendation": recommendation,\n    "chat_history": session["situation_chat"]\n}), 200`;

/* Preview wrapper */
export default function Dashboard({ trip_id, routeData = null, onShowMap }) {
    return (
        <div className="min-h-screen" style={{ background: theme.bg, color: theme.text }}>
            <div className="max-w-7xl mx-auto p-4 md:p-8">
                {/* pass routeData to VrpDashboard so it can use initialData instead of refetching */}
                <VrpDashboard trip_id={trip_id} initialData={routeData} onShowMap={onShowMap} />
            </div>
        </div>
    );
}
