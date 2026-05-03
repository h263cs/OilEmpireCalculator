import { useState, useEffect } from 'react';
import { GetConfig, GetAllDrills, GetAllRefineries, GetAllWalls, GetAllTotems, SaveConfig, UpdateConfig } from "../../wailsjs/go/main/App";

export const useAppState = () => {
  const [config, setConfig] = useState(null);
  const [drills, setDrills] = useState([]);
  const [refineries, setRefineries] = useState([]);
  const [walls, setWalls] = useState([]);
  const [totems, setTotems] = useState([]);
  const [rate, setRate] = useState('');
  const [currentCash, setCurrentCash] = useState('');
  const [cashPerUnit, setCashPerUnit] = useState(15);
  const [boost, setBoost] = useState(285);
  const [gasAmount, setGasAmount] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [drillSelections, setDrillSelections] = useState([]);
  const [activeWallName, setActiveWallNameState] = useState('');
  const [activeTotems, setActiveTotemNames] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const cfg = await GetConfig();
        setConfig(cfg);

        // Format rate with commas for display
        const rateValue = cfg.rate_per_second || 0;
        setRate(Number(rateValue).toLocaleString('en-US', { maximumFractionDigits: 0 }));

        const cashValue = cfg.current_cash
          ? Number(cfg.current_cash).toLocaleString('en-US', { maximumFractionDigits: 0 })
          : '';
        setCurrentCash(cashValue);

        setCashPerUnit(cfg.cash_per_unit);
        setBoost(cfg.boost_percent);
        setActiveWallNameState(cfg.active_wall_name || '');
        setActiveTotemNames(cfg.active_totems || []);

        const d = await GetAllDrills();
        setDrills(d && d.length > 0 ? d : [
          { Name: "Basic Drill", Price: 500 },
          { Name: "Strong Drill", Price: 1800 },
          { Name: "Enhanced Drill", Price: 3600 },
        ]);

        const r = await GetAllRefineries();
        setRefineries(r && r.length > 0 ? r : []);

        const w = await GetAllWalls();
        setWalls(w && w.length > 0 ? w : []);

        const t = await GetAllTotems();
        setTotems(t && t.length > 0 ? t : []);

        setReady(true);
      } catch (err) {
        console.error('Failed to load:', err);
        setConfig({ rate_per_second: 0, cash_per_unit: 15, boost_percent: 285, current_cash: 0 });
        setDrills([
          { Name: "Basic Drill", Price: 500 },
          { Name: "Strong Drill", Price: 1800 },
          { Name: "Enhanced Drill", Price: 3600 },
        ]);
        setRefineries([]);
        setWalls([]);
        setReady(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const setActiveWallName = async (wallName) => {
    setActiveWallNameState(wallName);
    const cfg = config || {};
    const updated = { ...cfg, active_wall_name: wallName };
    await UpdateConfig(
      cfg.rate_per_second || 0,
      cfg.cash_per_unit || 15,
      cfg.boost_percent || 285,
      cfg.current_cash || 0,
      wallName
    );
    setConfig(updated);
  };

  const setActiveTotems = async (totemNames) => {
    setActiveTotemNames(totemNames);
    const cfg = config || {};
    const updated = { ...cfg, active_totems: totemNames };
    await SaveConfig(updated);
    setConfig(updated);
  };

  const activeWall = walls.find(w => w.name === activeWallName) || null;
  const totalTotemBoost = totems
    .filter(t => activeTotems.includes(t.name))
    .reduce((sum, t) => sum + (t.boost ?? 0), 0);
  const effectiveBoost = 100 + (activeWall?.cash_boost ?? 0) + totalTotemBoost;

  return {
    config, setConfig,
    drills, setDrills,
    refineries, setRefineries,
    walls, setWalls,
    totems,
    rate, setRate,
    currentCash, setCurrentCash,
    cashPerUnit, setCashPerUnit,
    boost, setBoost,
    gasAmount, setGasAmount,
    goalAmount, setGoalAmount,
    drillSelections, setDrillSelections,
    activeWallName, setActiveWallName,
    activeWall, effectiveBoost,
    activeTotems, setActiveTotems, totalTotemBoost,
    ready
  };
};