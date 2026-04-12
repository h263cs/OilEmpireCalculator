import { useState, useEffect } from 'react';
import { calculateGasProfit } from '../utils/calculations';
import { formatLargeSync } from '../utils/formatters';

export const Calculations = ({ gasAmount, setGasAmount, cashPerUnit, boost }) => {
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    const calc = async () => {
      const p = await calculateGasProfit(gasAmount, cashPerUnit, boost);
      setProfit(p);
    };
    calc();
  }, [gasAmount, cashPerUnit, boost]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🔢 Calculations</h1>
      
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">🛢 Gas Profit</h3>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Gas Amount:</label>
          <input 
            type="text" 
            value={gasAmount}
            onChange={(e) => setGasAmount(e.target.value)}
            placeholder="e.g. 100k"
            className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="bg-slate-700 rounded p-3">
          <label className="text-slate-300">Total Profit: <span className="font-bold text-green-400">${formatLargeSync(profit)}</span></label>
        </div>
      </div>

      <p className="text-slate-400 italic">More calculations coming soon...</p>
    </div>
  );
};
