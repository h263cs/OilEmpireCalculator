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
  'Mini Multi Drill': '#39FF14',
  'Mini Diamond Drill': '#00D9FF',
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
  'Fusion Refinery': '#FF00FF',
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

const getItemColor = (itemName, customDrillsList) => {
  // Check custom drills first
  const customDrill = customDrillsList?.find(d => d.Name === itemName);
  if (customDrill) return customDrill.color;
  
  // Otherwise use predefined colors
  return DRILL_COLORS[itemName] || '#666666';
};

const getRowColor = (row) => {
  if (row < 5) return '#8B3A3A';
  if (row < 10) return '#D4A574';
  return '#4A7C4E';
};

export const LayoutDesigner = ({ drills = [], refineries = [] }) => {
  const [placedItems, setPlacedItems] = useState(() => {
    // Auto-load layout from localStorage on component mount
    const savedLayout = localStorage.getItem('oilEmpireLayout_slot_0');
    if (savedLayout) {
      try {
        return JSON.parse(savedLayout);
      } catch (e) {
        console.error('Error loading layout:', e);
        return [];
      }
    }
    return [];
  });
  const [selectedDrill, setSelectedDrill] = useState(drills[0] || null);
  const [draggingItem, setDraggingItem] = useState(null);
  const [isRotated, setIsRotated] = useState(false);
  const [hoverPos, setHoverPos] = useState(null);
  const [activeTab, setActiveTab] = useState('drills');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSaveSlots, setShowSaveSlots] = useState(false);
  const [saveSlots, setSaveSlots] = useState(() => {
    const saved = localStorage.getItem('oilEmpireLayout_slots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return Array(5).fill(null).map((_, i) => ({ name: `Slot ${i + 1}`, index: i, hasData: false }));
      }
    }
    return Array(5).fill(null).map((_, i) => ({ name: `Slot ${i + 1}`, index: i, hasData: false }));
  });
  const [editingSlotIndex, setEditingSlotIndex] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [currentSlot, setCurrentSlot] = useState(0);
  const [savedFeedback, setSavedFeedback] = useState(false);
  const [showCustomDrill, setShowCustomDrill] = useState(false);
  const [customDrills, setCustomDrills] = useState(() => {
    // Use sessionStorage so custom drills persist during page navigation but reset on app close
    const saved = sessionStorage.getItem('oilEmpireLayout_customDrills');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });
  const [customDrillForm, setCustomDrillForm] = useState({
    name: '',
    rate: '',
    width: '1',
    height: '1',
    color: '#4F46E5'
  });
  const [editingCustomDrill, setEditingCustomDrill] = useState(null);
  const gridRef = useRef(null);

  // Save custom drills to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('oilEmpireLayout_customDrills', JSON.stringify(customDrills));
  }, [customDrills]);

  // Combine regular drills with custom drills for display
  const allDrills = [...(drills || []), ...customDrills];

  // Auto-save layout whenever placedItems changes
  useEffect(() => {
    const layoutData = JSON.stringify(placedItems);
    localStorage.setItem(`oilEmpireLayout_slot_${currentSlot}`, layoutData);
    
    // Update slot metadata
    const updatedSlots = [...saveSlots];
    updatedSlots[currentSlot] = { ...updatedSlots[currentSlot], hasData: placedItems.length > 0 };
    setSaveSlots(updatedSlots);
    localStorage.setItem('oilEmpireLayout_slots', JSON.stringify(updatedSlots));
  }, [placedItems, currentSlot]);

  const loadSlot = (slotIndex) => {
    const savedLayout = localStorage.getItem(`oilEmpireLayout_slot_${slotIndex}`);
    setCurrentSlot(slotIndex);
    if (savedLayout) {
      try {
        setPlacedItems(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Error loading layout:', e);
        setPlacedItems([]);
      }
    } else {
      setPlacedItems([]);
    }
    setShowSaveSlots(false);
  };

  const renameSlot = (slotIndex, newName) => {
    const updatedSlots = [...saveSlots];
    updatedSlots[slotIndex] = { ...updatedSlots[slotIndex], name: newName };
    setSaveSlots(updatedSlots);
    localStorage.setItem('oilEmpireLayout_slots', JSON.stringify(updatedSlots));
    setEditingSlotIndex(null);
  };

  const addCustomDrill = () => {
    if (!customDrillForm.name.trim() || !customDrillForm.rate) {
      alert('Please fill in name and rate');
      return;
    }

    const newCustomDrill = {
      Name: customDrillForm.name,
      rate: parseInt(customDrillForm.rate) || 0,
      size: {
        width: parseInt(customDrillForm.width) || 1,
        height: parseInt(customDrillForm.height) || 1,
      },
      color: customDrillForm.color,
      isCustom: true,
    };

    const updatedCustom = [...customDrills, newCustomDrill];
    setCustomDrills(updatedCustom);
    localStorage.setItem('oilEmpireLayout_customDrills', JSON.stringify(updatedCustom));
    
    // Add to DRILL_COLORS so it displays with the custom color on the grid
    DRILL_COLORS[customDrillForm.name] = customDrillForm.color;

    // Reset form and close modal
    setCustomDrillForm({ name: '', rate: '', width: '1', height: '1', color: '#4F46E5' });
    setShowCustomDrill(false);
  };

  const deleteCustomDrill = (drillName) => {
    const updatedCustom = customDrills.filter(d => d.Name !== drillName);
    setCustomDrills(updatedCustom);
    localStorage.setItem('oilEmpireLayout_customDrills', JSON.stringify(updatedCustom));
    delete DRILL_COLORS[drillName];
  };

  const updateCustomDrill = (originalName, updatedDrill) => {
    const updatedCustom = customDrills.map(d => 
      d.Name === originalName 
        ? { ...d, ...updatedDrill }
        : d
    );
    setCustomDrills(updatedCustom);
    localStorage.setItem('oilEmpireLayout_customDrills', JSON.stringify(updatedCustom));
    
    // Update DRILL_COLORS if color changed
    if (updatedDrill.color) {
      delete DRILL_COLORS[originalName];
      DRILL_COLORS[updatedDrill.Name] = updatedDrill.color;
    }
    
    setEditingCustomDrill(null);
  };

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
    // Handle both nested size.width/height and flat width/height
    const width = selectedDrill.size?.width || selectedDrill.width || 1;
    const height = selectedDrill.size?.height || selectedDrill.height || 1;
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

  const deleteItem = (itemId) => {
    setPlacedItems(placedItems.filter(item => item.id !== itemId));
  };

  const clearLayout = () => {
    setPlacedItems([]);
    setShowClearConfirm(false);
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

  const handleAddCustomDrill = () => {
    if (!customDrillForm.name.trim()) {
      alert('Please enter a drill name');
      return;
    }
    
    const newCustomDrill = {
      Name: customDrillForm.name,
      rate: parseFloat(customDrillForm.rate) || 0,
      Price: 0,
      size: { width: parseInt(customDrillForm.width) || 1, height: parseInt(customDrillForm.height) || 1 },
      isCustom: true,
      color: customDrillForm.color
    };
    
    const updated = [...customDrills, newCustomDrill];
    setCustomDrills(updated);
    localStorage.setItem('oilEmpireLayout_customDrills', JSON.stringify(updated));
    DRILL_COLORS[customDrillForm.name] = customDrillForm.color;
    
    setCustomDrillForm({ name: '', rate: '', width: '1', height: '1', color: '#4F46E5' });
    setShowCustomDrill(false);
  };

  const calculatePreBoostRate = () => {
    let totalRate = 0;
    placedItems.forEach(item => {
      let drill = drills.find(d => d.name === item.name || d.Name === item.name);
      if (!drill) {
        drill = customDrills.find(d => d.Name === item.name);
      }
      if (drill) {
        totalRate += drill.rate || drill.Rate || 0;
      }
    });
    return totalRate;
  };

  const calculateTotalRate = () => {
    let totalRate = 0;
    placedItems.forEach(item => {
      let drill = drills.find(d => d.name === item.name || d.Name === item.name);
      if (!drill) {
        drill = customDrills.find(d => d.Name === item.name);
      }
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
        
        const rate = drill.rate || drill.Rate || 0;
        totalRate += rate * multiplier;
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
          onClick={() => {
            const layoutData = JSON.stringify(placedItems);
            localStorage.setItem(`oilEmpireLayout_slot_${currentSlot}`, layoutData);
            setSavedFeedback(true);
            setTimeout(() => setSavedFeedback(false), 3500);
          }}
          className={`px-4 py-2 rounded transition font-semibold text-white ${
            savedFeedback 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {savedFeedback ? '✅ Saved' : 'Save Layout'}
        </button>
        <button
          onClick={() => setShowSaveSlots(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded transition"
        >
          📁 {saveSlots[currentSlot]?.name || `Slot ${currentSlot + 1}`}
        </button>
      </div>

      {/* Save Slots Modal */}
      {showSaveSlots && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowSaveSlots(false)}
        >
          <div 
            className="bg-slate-800 rounded-lg p-8 max-w-2xl border-2 border-slate-600 max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">Save Slots</h2>
            <div className="space-y-2">
              {saveSlots.map((slot) => (
                <div key={slot.index} className="flex items-center gap-2 bg-slate-700 p-3 rounded">
                  {editingSlotIndex === slot.index ? (
                    <>
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') renameSlot(slot.index, editingName);
                          if (e.key === 'Escape') setEditingSlotIndex(null);
                        }}
                        className="flex-1 bg-slate-600 border border-slate-500 rounded px-2 py-1 text-white"
                        autoFocus
                      />
                      <button
                        onClick={() => renameSlot(slot.index, editingName)}
                        className="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingSlotIndex(null)}
                        className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => loadSlot(slot.index)}
                        className={`flex-1 text-left px-3 py-2 rounded transition ${
                          currentSlot === slot.index
                            ? 'bg-blue-600 text-white'
                            : slot.hasData
                            ? 'bg-slate-600 hover:bg-slate-500 text-white'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        <span className="font-semibold">{slot.name}</span>
                        {slot.hasData && <span className="text-xs ml-2">✓ Has data</span>}
                        {currentSlot === slot.index && <span className="text-xs ml-2">(Current)</span>}
                      </button>
                      <button
                        onClick={() => {
                          setEditingSlotIndex(slot.index);
                          setEditingName(slot.name);
                        }}
                        className="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-sm"
                      >
                        ✏️
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowSaveSlots(false)}
              className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Create Custom Drill Modal */}
      {showCustomDrill && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCustomDrill(false)}
        >
          <div 
            className="bg-slate-800 rounded-lg p-8 max-w-md border-2 border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">✨ Create Custom Drill</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-2">Drill Name:</label>
                <input 
                  type="text" 
                  value={customDrillForm.name}
                  onChange={(e) => setCustomDrillForm({ ...customDrillForm, name: e.target.value })}
                  placeholder="e.g. Mini Multi Drill"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Rate (petrol/sec):</label>
                <input 
                  type="text" 
                  value={customDrillForm.rate}
                  onChange={(e) => setCustomDrillForm({ ...customDrillForm, rate: e.target.value })}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Width:</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    value={customDrillForm.width}
                    onChange={(e) => setCustomDrillForm({ ...customDrillForm, width: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Height:</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    value={customDrillForm.height}
                    onChange={(e) => setCustomDrillForm({ ...customDrillForm, height: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2">Color:</label>
                <input 
                  type="color" 
                  value={customDrillForm.color}
                  onChange={(e) => setCustomDrillForm({ ...customDrillForm, color: e.target.value })}
                  className="w-full h-10 rounded border-2 border-slate-600 cursor-pointer"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={addCustomDrill}
                className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition font-semibold"
              >
                Create Drill
              </button>
              <button
                onClick={() => setShowCustomDrill(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Drill Creation Modal */}
      {showCustomDrill && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowCustomDrill(false)}
        >
          <div 
            className="bg-slate-800 rounded-lg p-8 max-w-md border-2 border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">🔧 Create Custom Drill</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Drill Name:</label>
                <input
                  type="text"
                  value={customDrillForm.name}
                  onChange={(e) => setCustomDrillForm({ ...customDrillForm, name: e.target.value })}
                  placeholder="e.g., Quantum Ultra Drill"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Rate (petrol/sec):</label>
                <input
                  type="text"
                  value={customDrillForm.rate}
                  onChange={(e) => setCustomDrillForm({ ...customDrillForm, rate: e.target.value })}
                  placeholder="e.g., 500000 or 1200000"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Width:</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={customDrillForm.width}
                    onChange={(e) => setCustomDrillForm({ ...customDrillForm, width: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Height:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={customDrillForm.height}
                    onChange={(e) => setCustomDrillForm({ ...customDrillForm, height: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Color:</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={customDrillForm.color}
                    onChange={(e) => setCustomDrillForm({ ...customDrillForm, color: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={customDrillForm.color}
                    onChange={(e) => setCustomDrillForm({ ...customDrillForm, color: e.target.value })}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={addCustomDrill}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition font-semibold"
              >
                Create Drill
              </button>
              <button
                onClick={() => setShowCustomDrill(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Custom Drill Modal */}
      {editingCustomDrill && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setEditingCustomDrill(null)}
        >
          <div 
            className="bg-slate-800 rounded-lg p-8 max-w-md border-2 border-slate-600"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-white mb-4">✏️ Edit Custom Drill</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Drill Name:</label>
                <input
                  type="text"
                  defaultValue={editingCustomDrill.Name}
                  onChange={(e) => setEditingCustomDrill({ ...editingCustomDrill, Name: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Rate (petrol/sec):</label>
                <input
                  type="text"
                  defaultValue={editingCustomDrill.rate}
                  onChange={(e) => setEditingCustomDrill({ ...editingCustomDrill, rate: parseInt(e.target.value) || 0 })}
                  placeholder="e.g., 500000 or 1200000"
                  className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Width:</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    defaultValue={editingCustomDrill.size?.width || 1}
                    onChange={(e) => setEditingCustomDrill({ 
                      ...editingCustomDrill, 
                      size: { ...editingCustomDrill.size, width: parseInt(e.target.value) || 1 } 
                    })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Height:</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    defaultValue={editingCustomDrill.size?.height || 1}
                    onChange={(e) => setEditingCustomDrill({ 
                      ...editingCustomDrill, 
                      size: { ...editingCustomDrill.size, height: parseInt(e.target.value) || 1 } 
                    })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Color:</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    defaultValue={editingCustomDrill.color}
                    onChange={(e) => setEditingCustomDrill({ ...editingCustomDrill, color: e.target.value })}
                    className="w-16 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue={editingCustomDrill.color}
                    onChange={(e) => setEditingCustomDrill({ ...editingCustomDrill, color: e.target.value })}
                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white text-xs"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => updateCustomDrill(editingCustomDrill.Name, editingCustomDrill)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition font-semibold"
              >
                Update Drill
              </button>
              <button
                onClick={() => setEditingCustomDrill(null)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
            {activeTab === 'drills' && (
              <>
                <button
                  onClick={() => setShowCustomDrill(true)}
                  className="sticky top-0 w-full px-4 py-2 rounded transition bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold mb-2 z-10"
                >
                  ✨ Create Custom Drill
                </button>
                {allDrills.map(drill => {
                  const drillName = drill.Name || drill.name;
                  const drillKey = drill.Name || drill.name;
                  return (
                    <div key={drillKey} className="relative group">
                    <button
                      onClick={() => setSelectedDrill(drill)}
                      className={`w-full px-4 py-2 rounded transition text-left ${
                        (selectedDrill.Name || selectedDrill.name) === drillName
                          ? 'bg-blue-600'
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-lg">{drill.isCustom ? '🔧' : '⛏️'}</span>
                          <div>
                            <span className="block text-sm">{drillName}</span>
                            <span className="text-xs text-slate-400">
                              {drill.size?.width || drill.width || 1}×{drill.size?.height || drill.height || 1}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded text-white whitespace-nowrap ml-2 ${drill.isCustom ? 'bg-purple-600' : 'bg-blue-600'}`}>
                          {drill.isCustom ? 'Custom' : 'Drill'}
                        </span>
                      </div>
                    </button>
                    {drill.isCustom && (
                      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
                        <button
                          onClick={() => setEditingCustomDrill(drill)}
                          className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => deleteCustomDrill(drillName)}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                );
                })}
              </>
            )}
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
                        {refinery.size?.width || refinery.width || 1}×{refinery.size?.height || refinery.height || 1}
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
                  const isCustom = customDrills && customDrills.some(d => d.Name === item.name);
                  const isRefinery = refineries && refineries.length > 0 && refineries.some(r => r.Name === item.name || r.name === item.name);
                  const icon = isCustom ? '🔧' : isRefinery ? '🏭' : '⛏️';
                  const badge = isCustom ? 'Custom' : isRefinery ? 'Refinery' : 'Drill';
                  const badgeColor = isCustom ? 'bg-purple-600' : isRefinery ? 'bg-purple-600' : 'bg-blue-600';
                  
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
              // Check if it's a custom drill
              const isCustom = item.isCustom || customDrills.some(d => d.Name === item.name);
              // Use the stored type, or fall back to checking refineries array
              const isRefinery = item.type === 'refinery' || (refineries && refineries.length > 0 && refineries.some(r => r.Name === item.name || r.name === item.name));
              const icon = isCustom ? '🔧' : isRefinery ? '🏭' : '⛏️';
              
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
                  title={`${item.name}${isCustom ? ' (Custom Drill)' : isRefinery ? ' (Refinery)' : ' (Drill)'}`}
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
          <div className="bg-slate-700 rounded p-4 flex flex-col">
            <p className="text-slate-400 text-sm mb-2">Pre-Boost Rate</p>
            <p className="text-slate-300 text-sm">Petrol/Second:</p>
            <p className="text-2xl font-bold text-blue-400">{calculatePreBoostRate().toLocaleString()}</p>
          </div>
          <div className="bg-slate-700 rounded p-4 flex flex-col">
            <p className="text-slate-400 text-sm mb-2">Post-Boost Rate</p>
            <p className="text-slate-300 text-sm">Petrol/Second:</p>
            <p className="text-2xl font-bold text-green-400">{calculateTotalRate().toLocaleString()}</p>
          </div>
          <div className="bg-slate-700 rounded p-4 flex flex-col">
            <p className="text-slate-400 text-sm mb-2">Total Storage</p>
            <p className="text-slate-300 text-sm">Capacity:</p>
            <p className="text-2xl font-bold text-orange-400">{calculateTotalStorage().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
