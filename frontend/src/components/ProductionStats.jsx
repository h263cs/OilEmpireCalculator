import { useState, useEffect } from 'react';
import { calculateProduction } from '../utils/calculations';
import { formatLargeSync } from '../utils/formatters';
import { UpdateConfig, ParseLargeNumber } from "../../wailsjs/go/main/App";

export const ProductionStats = ({
  rate, setRate,
  currentCash, setCurrentCash,
  cashPerUnit, setCashPerUnit,
  boost, setBoost,
  effectiveBoost,
  walls = [],
  activeWallName,
  setActiveWallName,
  totems = [],
  activeTotems = [],
  setActiveTotems,
  totalTotemBoost = 0,
  setConfig
}) => {
  const [production, setProduction] = useState({ petrol_per_hr: 0, cash_per_hr: 0 });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const calc = async () => {
      const result = await calculateProduction(rate, cashPerUnit, effectiveBoost);
      setProduction(result);
    };
    calc();
  }, [rate, cashPerUnit, effectiveBoost]);

  const handleSaveConfig = async () => {
    const rateNum = await ParseLargeNumber(rate) || 0;
    const cashNum = await ParseLargeNumber(currentCash) || 0;
    const wallName = activeWallName || '';
    await UpdateConfig(rateNum, cashPerUnit, boost, cashNum, wallName);
    setConfig({ rate_per_second: rateNum, cash_per_unit: cashPerUnit, boost_percent: boost, current_cash: cashNum, active_wall_name: wallName });

    setSaved(true);
    setTimeout(() => setSaved(false), 3500);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">📊 Production Stats</h1>
      
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">⛽ Rate</h3>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Petrol per second:</label>
          <input 
            type="text" 
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            placeholder="e.g. 30000 or 30K or 30,000"
            className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Current Cash (optional):</label>
          <input 
            type="text" 
            value={currentCash}
            onChange={(e) => setCurrentCash(e.target.value)}
            placeholder="e.g. 3.2B or 3,200,000,000"
            className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <button 
          onClick={handleSaveConfig}
          className={`w-full px-6 py-2 rounded transition font-semibold text-white ${
            saved 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {saved ? '✅ Saved' : 'Save Config'}
        </button>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">📈 Stats</h3>
        <div className="space-y-3">
          <div>
            <label className="text-slate-300">Petrol/hr: <span className="font-bold text-white">{formatLargeSync(production.petrol_per_hr)}</span></label>
          </div>
          <div>
            <label className="text-slate-300">Cash/hr: <span className="font-bold text-green-400">${formatLargeSync(production.cash_per_hr)}</span></label>
          </div>
          <div>
            <label className="text-slate-300">Total Boost: <span className="font-bold text-white">{effectiveBoost}%</span></label>
          </div>
          <div>
            <label className="text-slate-300 block mb-2">Cash per Unit: <span className="font-bold text-white">${cashPerUnit}</span></label>
            <input
              type="range"
              min="1"
              max="15"
              value={cashPerUnit}
              onChange={(e) => setCashPerUnit(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="border-t border-slate-700 pt-4">
            <label className="text-slate-300 font-semibold mb-3 block">🏺 Totem Boosts</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {totems.map((totem) => {
                const isActive = activeTotems.includes(totem.name);
                return (
                  <button
                    key={totem.name}
                    onClick={() => {
                      const updated = isActive
                        ? activeTotems.filter(n => n !== totem.name)
                        : [...activeTotems, totem.name];
                      setActiveTotems(updated);
                    }}
                    className={`rounded p-3 transition border-2 font-semibold text-center ${
                      isActive
                        ? 'bg-yellow-900 border-yellow-400 shadow-lg shadow-yellow-500/20 text-yellow-300'
                        : 'bg-slate-700 border-slate-600 hover:border-slate-500 text-slate-300'
                    }`}
                  >
                    <div className="text-sm">{totem.name}</div>
                    <div className="text-xs text-slate-400">+{totem.boost ?? 0}%</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="border-t border-slate-700 pt-4">
            <label className="text-slate-300 block mb-3 font-semibold">🧱 Active Wall</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {walls.map((wall, index) => (
                <button
                  key={index}
                  onClick={() => setActiveWallName(wall.name)}
                  className={`rounded p-3 transition border-2 font-semibold text-center ${
                    activeWallName === wall.name
                      ? 'bg-green-900 border-green-400 shadow-lg shadow-green-500/20 text-green-300'
                      : 'bg-slate-700 border-slate-600 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <div className="text-sm">{wall.name}</div>
                  <div className="text-xs text-slate-400">+{wall.cash_boost ?? 0}%</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};