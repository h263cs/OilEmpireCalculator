export const Sidebar = ({ currentPage, setCurrentPage, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className={`${sidebarOpen ? 'w-48' : 'w-20'} bg-slate-800 border-r border-slate-700 transition-all duration-300 flex flex-col`}>
      <div className={`p-4 border-b border-slate-700 flex items-center ${sidebarOpen ? 'justify-between' : 'justify-center'}`}>
        {sidebarOpen && <h2 className="font-bold text-lg">Menu</h2>}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-slate-400 hover:text-white flex flex-col gap-1 items-center justify-center"
        >
          <span className="w-6 h-0.5 bg-current block"></span>
          <span className="w-6 h-0.5 bg-current block"></span>
          <span className="w-6 h-0.5 bg-current block"></span>
        </button>
      </div>

      <nav className="flex-1 space-y-2 p-3">
        <NavButton
          page="production"
          icon="📊"
          label="Production Stats"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
        />
        <NavButton
          page="goals"
          icon="🏆"
          label="Goals"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
        />
        <NavButton
          page="calculations"
          icon="🔢"
          label="Calculations"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
        />
	  <NavButton
	  page="layout"
	  icon="🏗️"
	  label="Layout Designer"
	  currentPage={currentPage}
	  setCurrentPage={setCurrentPage}
	  sidebarOpen={sidebarOpen}
	  />
      </nav>
	  
      <div className="border-t border-slate-700 p-3">
        <NavButton
          page="about"
          icon="ℹ️"
          label="About"
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          sidebarOpen={sidebarOpen}
        />
      </div>
    </div>
  );
};

const NavButton = ({ page, icon, label, currentPage, setCurrentPage, sidebarOpen }) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`w-full px-4 py-3 rounded transition flex items-center ${sidebarOpen ? 'justify-start' : 'justify-center'} ${currentPage === page ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
  >
    <span className="text-xl">{icon}</span>
    {sidebarOpen && <span className="ml-3">{label}</span>}
  </button>
);
