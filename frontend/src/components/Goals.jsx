import { useState, useEffect } from 'react';
import { calculateDrillTime, calculateGoalTime } from '../utils/calculations';
import { formatLargeSync } from '../utils/formatters';

export const Goals = ({
  drillSelections, setDrillSelections,
  drills,
  rate, currentCash, cashPerUnit, boost,
  goalAmount, setGoalAmount,
}) => {
  const [drillTime, setDrillTime] = useState('—');
  const [goalTime, setGoalTime] = useState('—');

  useEffect(() => {
    const calc = async () => {
      const time = await calculateDrillTime(rate, currentCash, cashPerUnit, boost, drillSelections, drills);
      setDrillTime(time.time_left);
    };
    calc();
  }, [rate, currentCash, cashPerUnit, boost, drillSelections, drills]);

  useEffect(() => {
    const calc = async () => {
      const time = await calculateGoalTime(rate, currentCash, cashPerUnit, boost, goalAmount);
      setGoalTime(time);
    };
    calc();
  }, [rate, currentCash, cashPerUnit, boost, goalAmount]);

  const addDrillSelection = () => {
    if (drills.length > 0) {
      setDrillSelections([...drillSelections, { drillName: drills[0].Name, count: 1 }]);
    }
  };

  const removeDrillSelection = (idx) => {
    setDrillSelections(drillSelections.filter((_, i) => i !== idx));
  };

  const updateDrillSelection = (idx, field, value) => {
    const updated = [...drillSelections];
    updated[idx][field] = value;
    setDrillSelections(updated);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🏆 Goals</h1>
      
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">⛏ Drills</h3>
        <div className="space-y-3">
          {drillSelections.map((selection, idx) => (
            <div key={idx} className="flex gap-3 bg-slate-700 rounded p-3">
              <select 
                value={selection.drillName}
                onChange={(e) => updateDrillSelection(idx, 'drillName', e.target.value)}
                className="flex-1 bg-slate-600 border border-slate-500 rounded px-3 py-1 text-white focus:outline-none focus:border-blue-500"
              >
                {drills.map(drill => (
                  <option key={drill.Name} value={drill.Name}>
                    {drill.Name} - ${formatLargeSync(drill.Price)}
                  </option>
                ))}
              </select>
			  <input 
			  type="number" 
			  value={selection.count === 0 ? '' : selection.count}
			  onChange={(e) => updateDrillSelection(idx, 'count', parseInt(e.target.value) || 0)}
			  min="0"
			  placeholder="0"
			  className="w-20 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white text-center focus:outline-none focus:border-blue-500"
			  />
              <button
                onClick={() => removeDrillSelection(idx)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addDrillSelection}
            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          >
            + New Drill
          </button>
        </div>
        <div className="bg-slate-700 rounded p-3">
          <label className="text-slate-300">Time to afford: <span className="font-bold text-blue-400">{drillTime}</span></label>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">🎯 Cash Goal</h3>
        <div>
          <label className="block text-sm text-slate-300 mb-2">Goal Amount:</label>
          <input 
            type="text" 
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            placeholder="e.g. 1B"
            className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="bg-slate-700 rounded p-3">
          <label className="text-slate-300">Time to goal: <span className="font-bold text-blue-400">{goalTime}</span></label>
        </div>
      </div>
    </div>
  );
};
