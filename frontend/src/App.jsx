import { useState, useEffect } from 'react';
import './App.css';
import { useAppState } from './hooks/useAppState.js';
import { calculateGoalTime } from './utils/calculations.js';
import { Sidebar } from './components/Sidebar.jsx';
import { ProductionStats } from './components/ProductionStats.jsx';
import { Goals } from './components/Goals.jsx';
import { Calculations } from './components/Calculations.jsx';
import { About } from './components/About.jsx';
import { LayoutDesigner } from './components/LayoutDesigner.jsx';
import { CheckForUpdate, OpenURL } from '../wailsjs/go/main/App.js';

function App() {
  const [currentPage, setCurrentPage] = useState('production');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [updateInfo, setUpdateInfo] = useState(null);

  const appState = useAppState();

  useEffect(() => {
    CheckForUpdate().then(info => {
      if (info?.available) setUpdateInfo(info);
    }).catch(() => {});
  }, []);

  if (!appState.ready) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {updateInfo && (
        <div className="flex items-center justify-between bg-blue-700 px-4 py-2 text-sm shrink-0">
          <span>
            🚀 <span className="font-semibold">Update available:</span> {updateInfo.latest_version} — you're on {updateInfo.current_version}
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => OpenURL(updateInfo.release_url)}
              className="bg-white text-blue-700 font-semibold px-3 py-1 rounded hover:bg-blue-100 transition"
            >
              Download
            </button>
            <button
              onClick={() => setUpdateInfo(null)}
              className="text-blue-200 hover:text-white transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 overflow-auto p-6">
        {currentPage === 'production' && (
          <ProductionStats
            rate={appState.rate}
            setRate={appState.setRate}
            currentCash={appState.currentCash}
            setCurrentCash={appState.setCurrentCash}
            cashPerUnit={appState.cashPerUnit}
            setCashPerUnit={appState.setCashPerUnit}
            boost={appState.boost}
            setBoost={appState.setBoost}
            effectiveBoost={appState.effectiveBoost}
            walls={appState.walls}
            activeWallName={appState.activeWallName}
            setActiveWallName={appState.setActiveWallName}
            totems={appState.totems}
            activeTotems={appState.activeTotems}
            setActiveTotems={appState.setActiveTotems}
            totalTotemBoost={appState.totalTotemBoost}
            setConfig={appState.setConfig}
          />
        )}

        {currentPage === 'goals' && (
          <Goals
            drillSelections={appState.drillSelections}
            setDrillSelections={appState.setDrillSelections}
            drills={appState.drills}
            rate={appState.rate}
            currentCash={appState.currentCash}
            cashPerUnit={appState.cashPerUnit}
            boost={appState.effectiveBoost}
            goalAmount={appState.goalAmount}
            setGoalAmount={appState.setGoalAmount}
            calculateGoalTime={() => calculateGoalTime(appState.rate, appState.currentCash, appState.cashPerUnit, appState.effectiveBoost, appState.goalAmount)}
          />
        )}

        {currentPage === 'calculations' && (
          <Calculations
            gasAmount={appState.gasAmount}
            setGasAmount={appState.setGasAmount}
            cashPerUnit={appState.cashPerUnit}
            boost={appState.effectiveBoost}
          />
        )}

        {currentPage === 'layout' && (
          <LayoutDesigner
            drills={appState.drills}
            refineries={appState.refineries}
            walls={appState.walls}
          />
        )}

        {currentPage === 'about' && (
          <About />
        )}
      </div>
      </div>
    </div>
  );
}

export default App;