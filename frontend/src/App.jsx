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

function App() {
  const [currentPage, setCurrentPage] = useState('production');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const appState = useAppState();

  if (!appState.ready) {
    return <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex-1 overflow-auto p-6 h-screen">
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
            boost={appState.boost}
            goalAmount={appState.goalAmount}
            setGoalAmount={appState.setGoalAmount}
            calculateGoalTime={() => calculateGoalTime(appState.rate, appState.currentCash, appState.cashPerUnit, appState.boost, appState.goalAmount)}
          />
        )}

        {currentPage === 'calculations' && (
          <Calculations
            gasAmount={appState.gasAmount}
            setGasAmount={appState.setGasAmount}
            cashPerUnit={appState.cashPerUnit}
            boost={appState.boost}
          />
        )}

        {currentPage === 'layout' && (
          <LayoutDesigner drills={appState.drills} refineries={appState.refineries} walls={appState.walls} />
        )}

        {currentPage === 'about' && (
          <About />
        )}
      </div>
    </div>
  );
}

export default App;