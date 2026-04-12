import { useState, useRef, useEffect } from 'react';

const GRID_WIDTH = 15;
const GRID_HEIGHT = 20;
const CELL_SIZE = 30;
const DRILL_PADDING = 4; // 4px padding around drills

const DRILL_COLORS = {
  'Basic Drill': '#A9A9A9',
  'Strong Drill': '#B0B0B0',
  'Enhanced Drill': '#B8B8B8',
  'Speed Drill': '#C0C0C0',
  'Reinforced Drill': '#C8C8C8',
  'Industrial Drill': '#D0D0D0',
  'Double Industrial Drill': '#D8D8D8',
  'Turbo Drill': '#808080',
  'Mega Drill': '#888888',
  'Mega Emerald Drill': '#2ECC71',
  'Hell Drill': '#E74C3C',
  'Plasma Drill': '#9B59B6',
  'Huge Long Drill': '#52A552',
  'Mega Plasma Drill': '#39FF14',
  'Multi Drill': '#A9A9A9',
  'Lava Drill': '#FF5722',
  'Ice Plasma Drill': '#00D4FF',
  'Crystal Drill': '#BC13FE',
  'Diamond Drill': '#00D9FF',
  'Ruby Drill': '#E90052',
  'Quantum Drill': '#6B5FFF',
  'Mini Ruby Drill': '#800020',
  // Refineries
  'Basic Refinery': '#D4A574',
  'Enhanced Refinery': '#E8B76F',
  'Reinforced Refinery': '#F0C46A',
  'Advanced Refinery': '#F5D17D',
  'Plasma Refinery': '#FF9500',
  'Industrial Refinery': '#FF7F00',
  'Energy Refinery': '#FF6B00',
  'Mega Refinery': '#CC5500',
  'Quantum Refinery': '#9370DB',
  'Ice Refinery': '#40E0D0',
  'Hell Refinery': '#FF4444',
  'Mega Quantum Refinery': '#7B68EE',
  'Mega Energy Refinery': '#FF6347',
  'Lava Refinery': '#DC143C',
  'Crystal Refinery': '#00CED1',
  'Diamond Refinery': '#87CEEB',
  'Ruby Refinery': '#FF1493',
};

const getDarkerColor = (hex) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = -30;
  const usePound = true;
  let R = (num >> 16) + amt;
  let G = (num >> 8 & 0x00FF) + amt;
  let B = (num & 0x0000FF) + amt;
  R = R > 255 ? 255 : R < 0 ? 0 : R;
  G = G > 255 ? 255 : G < 0 ? 0 : G;
  B = B > 255 ? 255 : B < 0 ? 0 : B;
  return (usePound ? "#" : "") + (0x1000000 + (R<16?0:1)*16777216 + (G<16?0:1)*65536 + (B<16?0:1)*256 + R*65536 + G*256 + B).toString(16).slice(1);
};

const getRowColor = (row) => {
  if (row < 5) return '#8B3A3A';
  if (row < 10) return '#D4A574';
  return '#4A7C4E';
};

export const LayoutDesigner = ({ drills, refineries = [] }) => {
  const [placedItems, setPlacedItems] = useState([]);
  const [selectedDrill, setSelectedDrill] = useState(drills[0] || null);
  const [draggingItem, setDraggingItem] = useState(null);
  const [isRotated, setIsRotated] = useState(false);
  const [hoverPos, setHoverPos] = useState(null);
  const [activeTab, setActiveTab] = useState('drills');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const gridRef = useRef(null);

  if (!selectedDrill) return <div>Loading drills...</div>;

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key.toLowerCase() === 'r') {
        setIsRotated(!isRotated);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRotated]);

  const getDisplaySize = () => {
    const width = selectedDrill.size.width;
    const height = selectedDrill.size.height;
    return isRotated ? { width: height, height: width } : { width, height };
  };

  const getGridZone = (pos) => Math.floor(pos / 5);
  const getZoneStart = (zone) => zone * 5;

  const canPlaceItem = (col, row, width, height, excludeId = null) => {
    // Check if drill fits within a single 5x5 grid zone
    const startZoneCol = getGridZone(col);
    const endZoneCol = getGridZone(col + width - 1);
    const startZoneRow = getGridZone(row);
    const endZoneRow = getGridZone(row + height - 1);
    
    // Drill must be completely within one zone horizontally and vertically
    if (startZoneCol !== endZoneCol || startZoneRow !== endZoneRow) {
      return false;
    }

    // Check bounds
    if (col + width > GRID_WIDTH || row + height > GRID_HEIGHT) {
      return false;
    }

    // Check collisions
    for (const item of placedItems) {
      if (excludeId && item.id === excludeId) continue;

      const itemRight = item.col + item.width;
      const itemBottom = item.row + item.height;
      const newRight = col + width;
      const newBottom = row + height;

      if (!(col >= itemRight || newRight <= item.col || 
            row >= itemBottom || newBottom <= item.row)) {
        return false;
      }
    }

    return true;
  };

  const snapToGrid = (col, row, width, height) => {
    const startZoneCol = getGridZone(col);
    const startZoneRow = getGridZone(row);
    
    const zoneStartCol = getZoneStart(startZoneCol);
    const zoneStartRow = getZoneStart(startZoneRow);
    const zoneEndCol = zoneStartCol + 5;
    const zoneEndRow = zoneStartRow + 5;
    
    // Snap to the nearest valid position within the zone
    let snappedCol = col;
    let snappedRow = row;
    
    // If drill would go past the zone boundary, snap to the other side
    if (col + width > zoneEndCol) {
      snappedCol = Math.max(zoneStartCol, zoneEndCol - width);
    }
    
    if (row + height > zoneEndRow) {
      snappedRow = Math.max(zoneStartRow, zoneEndRow - height);
    }
    
    return { snappedCol, snappedRow };
  };

  const handleGridClick = (e) => {
    if (!gridRef.current || !selectedDrill) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const displaySize = getDisplaySize();
    let col = Math.floor(x / CELL_SIZE) - Math.floor(displaySize.width / 2);
    let row = Math.floor(y / CELL_SIZE) - Math.floor(displaySize.height / 2);

    // Snap to grid zone
    const { snappedCol, snappedRow } = snapToGrid(col, row, displaySize.width, displaySize.height);
    col = snappedCol;
    row = snappedRow;

    if (col < 0 || col >= GRID_WIDTH || row < 0 || row >= GRID_HEIGHT) return;

    if (canPlaceItem(col, row, displaySize.width, displaySize.height)) {
      // Determine if selected item is a refinery or drill
      const isRefinery = refineries && refineries.some(r => r.name === (selectedDrill.Name || selectedDrill.name));
      const itemName = selectedDrill.Name || selectedDrill.name;
      
      const newItem = {
        id: Date.now(),
        col,
        row,
        width: displaySize.width,
        height: displaySize.height,
        name: itemName,
        type: isRefinery ? 'refinery' : 'drill',
        color: DRILL_COLORS[itemName] || '#8B4513',
        rotated: isRotated,
      };
      setPlacedItems([...placedItems, newItem]);
    }
  };

  const handleItemMouseDown = (e, itemId) => {
    e.stopPropagation();
    setDraggingItem(itemId);
  };

  const handleItemDoubleClick = (e, itemId) => {
    e.stopPropagation();
    deleteItem(itemId);
  };

  const handleMouseMove = (e) => {
    if (!gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    // Update hover preview with snapped position
    if (!draggingItem) {
      const displaySize = getDisplaySize();
      let previewCol = Math.max(0, Math.min(col - Math.floor(displaySize.width / 2), GRID_WIDTH - displaySize.width));
      let previewRow = Math.max(0, Math.min(row - Math.floor(displaySize.height / 2), GRID_HEIGHT - displaySize.height));
      
      // Snap preview to grid zone
      const { snappedCol, snappedRow } = snapToGrid(previewCol, previewRow, displaySize.width, displaySize.height);
      previewCol = snappedCol;
      previewRow = snappedRow;
      
      setHoverPos({ col: previewCol, row: previewRow, ...displaySize });
    }

    // Handle dragging with snapping
    if (draggingItem) {
      setPlacedItems(items =>
        items.map(item => {
          if (item.id === draggingItem) {
            const displaySize = getDisplaySize();
            let newCol = Math.max(0, Math.min(col - Math.floor(displaySize.width / 2), GRID_WIDTH - displaySize.width));
            let newRow = Math.max(0, Math.min(row - Math.floor(displaySize.height / 2), GRID_HEIGHT - displaySize.height));
            
            // Snap to grid zone
            const { snappedCol, snappedRow } = snapToGrid(newCol, newRow, item.width, item.height);
            newCol = snappedCol;
            newRow = snappedRow;
            
            if (canPlaceItem(newCol, newRow, item.width, item.height, item.id)) {
              return { ...item, col: newCol, row: newRow };
            }
          }
          return item;
        })
      );
    }
  };

  const handleMouseLeave = () => {
    setDraggingItem(null);
    setHoverPos(null);
  };

  const handleMouseUp = () => {
    setDraggingItem(null);
  };

  const deleteItem = (itemId) => {
    setPlacedItems(placedItems.filter(item => item.id !== itemId));
  };

  const clearLayout = () => {
    setPlacedItems([]);
    setShowClearConfirm(false);
  };

  const saveLayout = () => {
    const layoutData = JSON.stringify(placedItems);
    localStorage.setItem('oilEmpireLayout', layoutData);
  };

  const loadLayout = () => {
    const savedLayout = localStorage.getItem('oilEmpireLayout');
    if (savedLayout) {
      try {
        setPlacedItems(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Error loading layout:', e);
      }
    }
  };

  const calculatePreBoostRate = () => {
    let totalRate = 0;
    placedItems.forEach(item => {
      const drill = drills.find(d => d.Name === item.name);
      if (drill) {
        totalRate += drill.rate;
      }
    });
    return totalRate;
  };

  const calculateTotalRate = () => {
    let totalRate = 0;
    placedItems.forEach(item => {
      const drill = drills.find(d => d.Name === item.name);
      if (drill) {
        let multiplier = 1;
        
        if (item.row < 5) {
          if (item.col < 5 || item.col >= 10) {
            multiplier = 3;
          } else {
            multiplier = 5;
          }
        }
        else if (item.row < 10) {
          multiplier = 2;
        }
        else {
          multiplier = 1;
        }
        
        totalRate += drill.rate * multiplier;
      }
    });
    return totalRate;
  };

  const calculateTotalStorage = () => {
    let totalStorage = 0;
    placedItems.forEach(item => {
      const refinery = refineries.find(r => r.Name === item.name || r.name === item.name);
      if (refinery) {
        totalStorage += (refinery.Storage || refinery.storage || 0);
      }
    });
    return totalStorage;
  };

  const consolidatedItems = placedItems.reduce((acc, item) => {
    const existing = acc.find(x => x.name === item.name);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: item.name, count: 1 });
    }
    return acc;
  }, []);

  const displaySize = getDisplaySize();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">🏗️ Layout Designer</h1>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowClearConfirm(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition"
        >
          Clear Layout
        </button>
        <button
          onClick={saveLayout}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition"
        >
          Save Layout
        </button>
        <button
          onClick={loadLayout}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition"
        >
          Load Layout
        </button>
      </div>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-8 max-w-sm border-2 border-slate-600">
            <h2 className="text-2xl font-bold text-white mb-4">Clear Layout?</h2>
            <p className="text-slate-300 mb-6">Are you sure you want to delete all placed items? This cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={clearLayout}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition font-semibold"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Controls */}
        <div className="bg-slate-800 rounded-lg p-6 space-y-4 h-fit">
          <div>
            <h3 className="text-xl font-semibold mb-2">Item Selection</h3>
            <div className="bg-slate-700 rounded p-3 text-sm text-slate-300 mb-3">
              <p>Size: {displaySize.width}×{displaySize.height}</p>
              <p className="text-xs mt-1">Press <span className="bg-slate-600 px-1 rounded">R</span> to rotate</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-slate-700 overflow-x-auto">
            {['drills', 'refineries', 'totems', 'misc'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 transition text-sm whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-400'
                    : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {activeTab === 'drills' && drills.map(drill => (
              <button
                key={drill.Name}
                onClick={() => setSelectedDrill(drill)}
                className={`w-full px-4 py-2 rounded transition text-left ${
                  selectedDrill.Name === drill.Name
                    ? 'bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">⛏️</span>
                    <div>
                      <span className="block text-sm">{drill.Name}</span>
                      <span className="text-xs text-slate-400">
                        {drill.size.width}×{drill.size.height}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-blue-600 px-2 py-1 rounded text-white whitespace-nowrap ml-2">Drill</span>
                </div>
              </button>
            ))}
            {activeTab === 'refineries' && refineries && refineries.length > 0 ? refineries.map(refinery => (
              <button
                key={refinery.name || refinery.Name}
                onClick={() => setSelectedDrill(refinery)}
                className={`w-full px-4 py-2 rounded transition text-left ${
                  (selectedDrill.name || selectedDrill.Name) === (refinery.name || refinery.Name)
                    ? 'bg-blue-600'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">🏭</span>
                    <div>
                      <span className="block text-sm">{refinery.name || refinery.Name || 'Unknown'}</span>
                      <span className="text-xs text-slate-400">
                        {refinery.size?.width}×{refinery.size?.height}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white whitespace-nowrap ml-2">Refinery</span>
                </div>
              </button>
            )) : (
              <p className="text-slate-400 text-sm py-4">No refineries loaded</p>
            )}
            {activeTab === 'totems' && (
              <p className="text-slate-400 text-sm py-4">Totems coming soon...</p>
            )}
            {activeTab === 'misc' && (
              <p className="text-slate-400 text-sm py-4">Misc coming soon...</p>
            )}
          </div>
          
          <div className="border-t border-slate-700 pt-4">
            <h4 className="text-sm text-slate-300 mb-2">Placed Items ({placedItems.length})</h4>
            <div className="space-y-1 text-sm max-h-48 overflow-y-auto">
              {consolidatedItems.length === 0 ? (
                <p className="text-slate-400">No items placed</p>
              ) : (
                consolidatedItems.map(item => {
                  const isRefinery = refineries && refineries.length > 0 && refineries.some(r => r.Name === item.name || r.name === item.name);
                  const icon = isRefinery ? '🏭' : '⛏️';
                  const badge = isRefinery ? 'Refinery' : 'Drill';
                  const badgeColor = isRefinery ? 'bg-purple-600' : 'bg-blue-600';
                  
                  return (
                    <div key={item.name} className="bg-slate-700 p-2 rounded flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-sm">{icon}</span>
                        <span className="text-xs">{item.name} × <span className="font-bold">{item.count}</span></span>
                      </div>
                      <span className={`text-xs ${badgeColor} px-2 py-0.5 rounded text-white whitespace-nowrap`}>{badge}</span>
                    </div>
                  );
                })
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2">Double-click on grid to delete</p>
          </div>
        </div>

        {/* Grid */}
        <div className="bg-slate-800 rounded-lg p-6 overflow-x-auto flex flex-col items-center">
          <h3 className="text-xl font-semibold mb-4">Base Layout</h3>
          <div
            ref={gridRef}
            onClick={handleGridClick}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="relative border-2 border-slate-600 cursor-crosshair select-none inline-block"
            style={{
              width: GRID_WIDTH * CELL_SIZE,
              height: GRID_HEIGHT * CELL_SIZE,
              background: '#1e293b',
            }}
          >
            {Array.from({ length: GRID_HEIGHT }).map((_, row) =>
              Array.from({ length: GRID_WIDTH }).map((_, col) => {
                const borderTop = row % 5 === 0 ? '2px solid rgba(0,0,0,0.8)' : '1px solid rgba(0,0,0,0.3)';
                const borderLeft = col % 5 === 0 ? '2px solid rgba(0,0,0,0.8)' : '1px solid rgba(0,0,0,0.3)';
                const borderRight = '1px solid rgba(0,0,0,0.3)';
                const borderBottom = '1px solid rgba(0,0,0,0.3)';

                return (
                  <div
                    key={`${col}-${row}`}
                    style={{
                      position: 'absolute',
                      left: col * CELL_SIZE,
                      top: row * CELL_SIZE,
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: getRowColor(row),
                      borderTop,
                      borderLeft,
                      borderRight,
                      borderBottom,
                      boxSizing: 'border-box',
                    }}
                  />
                );
              })
            )}

            {hoverPos && (
              <div
                style={{
                  position: 'absolute',
                  left: hoverPos.col * CELL_SIZE + DRILL_PADDING,
                  top: hoverPos.row * CELL_SIZE + DRILL_PADDING,
                  width: hoverPos.width * CELL_SIZE - (DRILL_PADDING * 2),
                  height: hoverPos.height * CELL_SIZE - (DRILL_PADDING * 2),
                  backgroundColor: DRILL_COLORS[selectedDrill.Name] || '#8B4513',
                  border: '2px dashed #fff',
                  opacity: 0.5,
                  pointerEvents: 'none',
                  boxSizing: 'border-box',
                }}
              />
            )}

            {placedItems.map(item => {
              const borderColor = getDarkerColor(item.color);
              // Use the stored type, or fall back to checking refineries array
              const isRefinery = item.type === 'refinery' || (refineries && refineries.length > 0 && refineries.some(r => r.Name === item.name));
              const icon = isRefinery ? '🏭' : '⛏️';
              
              return (
                <div
                  key={item.id}
                  onMouseDown={(e) => handleItemMouseDown(e, item.id)}
                  onDoubleClick={(e) => handleItemDoubleClick(e, item.id)}
                  style={{
                    position: 'absolute',
                    left: item.col * CELL_SIZE + DRILL_PADDING,
                    top: item.row * CELL_SIZE + DRILL_PADDING,
                    width: item.width * CELL_SIZE - (DRILL_PADDING * 2),
                    height: item.height * CELL_SIZE - (DRILL_PADDING * 2),
                    backgroundColor: item.color,
                    border: `2px solid ${borderColor}`,
                    cursor: draggingItem === item.id ? 'grabbing' : 'grab',
                    opacity: draggingItem === item.id ? 0.8 : 1,
                    zIndex: draggingItem === item.id ? 10 : 1,
                    boxSizing: 'border-box',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}
                  className="transition-opacity"
                  title={`${item.name}${isRefinery ? ' (Refinery)' : ' (Drill)'}`}
                >
                  <span style={{ opacity: 0.4 }}>{icon}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Production Stats */}
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">📊 Production Rate</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-700 rounded p-4">
            <p className="text-slate-400 text-sm mb-2">Pre-Boost Rate</p>
            <p className="text-slate-300">Petrol/Second: <span className="text-2xl font-bold text-blue-400">{calculatePreBoostRate()}</span></p>
          </div>
          <div className="bg-slate-700 rounded p-4">
            <p className="text-slate-400 text-sm mb-2">Post-Boost Rate</p>
            <p className="text-slate-300">Petrol/Second: <span className="text-2xl font-bold text-green-400">{calculateTotalRate()}</span></p>
          </div>
          <div className="bg-slate-700 rounded p-4">
            <p className="text-slate-400 text-sm mb-2">Total Storage</p>
            <p className="text-slate-300">Capacity: <span className="text-2xl font-bold text-orange-400">{calculateTotalStorage()}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
