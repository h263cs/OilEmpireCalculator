export const About = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ℹ️ About</h1>
      
      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Oil Empire Calculator</h3>
        <p className="text-slate-300">
          A powerful calculator tool for Oil Empire optimization. Calculate production rates, 
          drill affordability, and track your cash goals.
        </p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Features</h3>
        <ul className="text-slate-300 space-y-2">
          <li>• Production statistics and rates</li>
          <li>• Drill affordability calculator</li>
          <li>• Cash goal tracker</li>
          <li>• Gas profit calculator</li>
          <li>• Configurable sale price and totem boost multiplier</li>
        </ul>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Version</h3>
        <p className="text-slate-300">v0.2-beta.1</p>
      </div>

      <div className="bg-slate-800 rounded-lg p-6 space-y-4">
        <h3 className="text-xl font-semibold">Built With</h3>
        <p className="text-slate-300">
          Go • React • Wails • Tailwind CSS
        </p>
      </div>
    </div>
  );
};
