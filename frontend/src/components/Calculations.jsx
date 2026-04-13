import { useState, useEffect } from 'react';
import { calculateGasProfit } from '../utils/calculations';
import { formatLargeSync } from '../utils/formatters';
import { GetPackDrills, CalculatePacksNeeded99Confidence, CalculateBulkRainbowPackCost } from '../../wailsjs/go/main/App.js';

export const Calculations = ({ gasAmount, setGasAmount, cashPerUnit, boost }) => {
  const [profit, setProfit] = useState(0);
  const [selectedPack, setSelectedPack] = useState('rainbow');
  const [selectedDrill, setSelectedDrill] = useState('');
  const [targetQuantity, setTargetQuantity] = useState('');
  const [packDrills, setPackDrills] = useState({
    rainbow: [],
    infinity: []
  });

  const RAINBOW_PACK_COST_ROBUX = 229;
  const INFINITY_PACK_COST_GAS = 1_500_000;

  useEffect(() => {
    const calc = async () => {
      const p = await calculateGasProfit(gasAmount, cashPerUnit, boost);
      setProfit(p);
    };
    calc();
  }, [gasAmount, cashPerUnit, boost]);

  // Load pack data from backend
  useEffect(() => {
    const loadPacks = async () => {
      try {
        const rainbowDrills = await GetPackDrills('rainbow');
        const infinityDrills = await GetPackDrills('infinity');
        setPackDrills({
          rainbow: rainbowDrills || [],
          infinity: infinityDrills || []
        });
      } catch (err) {
        console.error('Error loading pack data:', err);
      }
    };
    loadPacks();
  }, []);

  const calculatePacksNeeded = async () => {
    if (!selectedDrill || !targetQuantity) return 0;

    const drills = selectedPack === 'rainbow' ? packDrills.rainbow : packDrills.infinity;
    const drill = drills.find(d => d.name === selectedDrill);
    
    if (!drill) return 0;

    const target = parseFloat(targetQuantity) || 0;
    const dropRate = drill.drop_rate || 0;

    if (target === 0 || dropRate === 0) return 0;

    // Call backend function for 99% confidence calculation
    return await CalculatePacksNeeded99Confidence(target, dropRate);
  };

  const [packsNeeded, setPacksNeeded] = useState(0);
  const [bulkPricingInfo, setBulkPricingInfo] = useState(null);

  // Recalculate whenever dependencies change
  useEffect(() => {
    const calc = async () => {
      const result = await calculatePacksNeeded();
      setPacksNeeded(result);

      // Calculate bulk pricing for Rainbow packs
      if (selectedPack === 'rainbow' && result > 0) {
        const bulkInfo = await CalculateBulkRainbowPackCost(result);
        setBulkPricingInfo(bulkInfo);
      } else {
        setBulkPricingInfo(null);
      }
    };
    calc();
  }, [selectedDrill, targetQuantity, selectedPack, packDrills]);

  const totalCost = selectedPack === 'rainbow' 
    ? packsNeeded * RAINBOW_PACK_COST_ROBUX
    : packsNeeded * INFINITY_PACK_COST_GAS;

  const currentDrills = selectedPack === 'rainbow' ? packDrills.rainbow : packDrills.infinity;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🔢 Calculations</h1>
      
      {/* Gas Profit Section */}
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

      {/* Pack Drop Calculator */}
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">🎁 Pack Drop Calculator (99% Confidence)</h3>
        <p className="text-slate-400 text-sm">Calculate how many packs you need to GUARANTEE a target quantity of a drill with 99% certainty</p>
        
        <div className="space-y-4">
          {/* Pack Selection */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">Select Pack:</label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedPack('rainbow');
                  setSelectedDrill('');
                }}
                className={`flex-1 px-4 py-2 rounded transition ${
                  selectedPack === 'rainbow'
                    ? 'bg-orange-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                🌈 Rainbow Pack (229 Robux)
              </button>
              <button
                onClick={() => {
                  setSelectedPack('infinity');
                  setSelectedDrill('');
                }}
                className={`flex-1 px-4 py-2 rounded transition ${
                  selectedPack === 'infinity'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                ♾️ Infinity Pack (1.5M Gas)
              </button>
            </div>
          </div>

          {/* Drill Selection Dropdown */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">Select Drill:</label>
            <select
              value={selectedDrill}
              onChange={(e) => setSelectedDrill(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="">Choose a drill...</option>
              {currentDrills && currentDrills.map(drill => (
                <option key={drill.name} value={drill.name}>
                  {drill.name} ({drill.drop_rate}%)
                </option>
              ))}
            </select>
            {(!currentDrills || currentDrills.length === 0) && (
              <p className="text-xs text-slate-400 mt-1">⏳ Loading pack data...</p>
            )}
          </div>

          {/* Target Quantity */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">Target Quantity:</label>
            <input
              type="number"
              min="0"
              value={targetQuantity}
              onChange={(e) => setTargetQuantity(e.target.value)}
              placeholder="How many drills do you want?"
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Results */}
          {(targetQuantity && selectedDrill) && (
            <div className="bg-slate-700 rounded-lg p-4 space-y-3 border-l-4 border-blue-500">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-400">Packs Needed (99%)</p>
                  <p className="text-3xl font-bold text-blue-400">{packsNeeded.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Cost</p>
                  <p className={`text-3xl font-bold ${selectedPack === 'rainbow' ? 'text-orange-400' : 'text-purple-400'}`}>
                    {(bulkPricingInfo ? bulkPricingInfo.total_cost : totalCost).toLocaleString()} {selectedPack === 'rainbow' ? 'Robux' : 'Gas'}
                  </p>
                </div>
              </div>

              {/* Bulk Pricing Breakdown for Rainbow */}
              {bulkPricingInfo && (
                <div className="bg-slate-600 rounded p-3 space-y-2">
                  <p className="text-sm text-slate-300 font-semibold">Bulk Pricing Breakdown:</p>
                  <p className="text-xs text-slate-400">{bulkPricingInfo.breakdown}</p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {bulkPricingInfo.packs.bulk_8 > 0 && (
                      <div className="bg-slate-500 rounded px-2 py-1">
                        <p className="text-slate-300">{bulkPricingInfo.packs.bulk_8}x 8-pack</p>
                        <p className="text-orange-300">{(bulkPricingInfo.packs.bulk_8 * 1399).toLocaleString()} R</p>
                      </div>
                    )}
                    {bulkPricingInfo.packs.triple > 0 && (
                      <div className="bg-slate-500 rounded px-2 py-1">
                        <p className="text-slate-300">{bulkPricingInfo.packs.triple}x 3-pack</p>
                        <p className="text-orange-300">{(bulkPricingInfo.packs.triple * 569).toLocaleString()} R</p>
                      </div>
                    )}
                    {bulkPricingInfo.packs.single > 0 && (
                      <div className="bg-slate-500 rounded px-2 py-1">
                        <p className="text-slate-300">{bulkPricingInfo.packs.single}x 1-pack</p>
                        <p className="text-orange-300">{(bulkPricingInfo.packs.single * 229).toLocaleString()} R</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400 pt-2">
                Buy {packsNeeded} packs to GUARANTEE {targetQuantity} {selectedDrill}(s) with 99% confidence
              </p>
            </div>
          )}
        </div>
      </div>

      <p className="text-slate-400 italic">More calculations coming soon...</p>
    </div>
  );
};
