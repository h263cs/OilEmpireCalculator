import { useState, useEffect } from 'react';
import { GetConfig, GetAllDrills } from "../../wailsjs/go/main/App";

export const useAppState = () => {
  const [config, setConfig] = useState(null);
  const [drills, setDrills] = useState([]);
  const [rate, setRate] = useState('');
  const [currentCash, setCurrentCash] = useState('');
  const [cashPerUnit, setCashPerUnit] = useState(15);
  const [boost, setBoost] = useState(285);
  const [gasAmount, setGasAmount] = useState('');
  const [goalAmount, setGoalAmount] = useState('');
  const [drillSelections, setDrillSelections] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const cfg = await GetConfig();
        setConfig(cfg);
        setRate(cfg.rate_per_second.toString());
        setCurrentCash(cfg.current_cash.toString());
        setCashPerUnit(cfg.cash_per_unit);
        setBoost(cfg.boost_percent);
        
        const d = await GetAllDrills();
        setDrills(d && d.length > 0 ? d : [
          { Name: "Basic Drill", Price: 500 },
          { Name: "Strong Drill", Price: 1800 },
          { Name: "Enhanced Drill", Price: 3600 },
        ]);
        
        setReady(true);
      } catch (err) {
        console.error('Failed to load:', err);
        setConfig({ rate_per_second: 0, cash_per_unit: 15, boost_percent: 285, current_cash: 0 });
        setDrills([
          { Name: "Basic Drill", Price: 500 },
          { Name: "Strong Drill", Price: 1800 },
          { Name: "Enhanced Drill", Price: 3600 },
        ]);
        setReady(true);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return {
    config, setConfig,
    drills, setDrills,
    rate, setRate,
    currentCash, setCurrentCash,
    cashPerUnit, setCashPerUnit,
    boost, setBoost,
    gasAmount, setGasAmount,
    goalAmount, setGoalAmount,
    drillSelections, setDrillSelections,
    ready
  };
};