import { useState, useEffect } from 'react';
import { calculateProduction } from '../utils/calculations';
import { formatLargeSync } from '../utils/formatters';
import { UpdateConfig, ParseLargeNumber, GetAllWalls } from "../../wailsjs/go/main/App";

export const ProductionStats = ({ 
  rate, setRate, 
  currentCash, setCurrentCash, 
  cashPerUnit, setCashPerUnit, 
  boost, setBoost,
  setConfig 
}) => {
  const [production, setProduction] = useState({ petrol_per_hr: 0, cash_per_hr: 0 });
  const [saved, setSaved] = useState(false);
  const [activeWall, setActiveWall] = useState(0);
  const [walls, setWalls] = useState([]);

  // Load walls on mount
  useEffect(() => {
    const loadWalls = async () => {
      try {
        const wallList = await GetAllWalls();
        setWalls(wallList || []);
        if (wallList && wallList.length > 0) {
          setActiveWall(wallList[0].cash_boost);
        }
      } catch (err) {
        console.error('Error loading walls:', err);
      }
    };
    loadWalls();
  }, []);

  useEffect(() => {
    const calc = async () => {
      const result = await calculateProduction(rate, cashPerUnit, boost);
      setProduction(result);
    };
    calc();
  }, [rate, cashPerUnit, boost]);

  const handleSaveConfig = async () => {
    const rateNum = await ParseLargeNumber(rate) || 0;
    const cashNum = await ParseLargeNumber(currentCash) || 0;
    await UpdateConfig(rateNum, cashPerUnit, boost, cashNum);
    setConfig({ rate_per_second: rateNum, cash_per_unit: cashPerUnit, boost_percent: boost, current_cash: cashNum });
    
    // Show saved state
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
          <div>
            <label className="text-slate-300 block mb-2">Boost: <span className="font-bold text-white">{boost}%</span></label>
            <input 
              type="range" 
              min="100" 
              max="385"
              step="5"
              value={boost}
              onChange={(e) => setBoost(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="border-t border-slate-700 pt-4">
            <label className="text-slate-300 block mb-3 font-semibold">🧱 Active Wall</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {walls.map((wall, index) => (
                <button
                  key={index}
                  onClick={() => setActiveWall(wall.cash_boost)}
                  className={`rounded p-3 transition border-2 font-semibold text-center ${
                    activeWall === wall.cash_boost
                      ? 'bg-green-900 border-green-400 shadow-lg shadow-green-500/20 text-green-300'
                      : 'bg-slate-700 border-slate-600 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  {wall.cash_boost > 0 ? `+${wall.cash_boost}%` : '0%'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
