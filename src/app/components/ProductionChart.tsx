import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function ProductionChart() {
  const data = [
    { month: "Jan", production: 400, target: 380 },
    { month: "Feb", production: 450, target: 420 },
    { month: "Mar", production: 420, target: 440 },
    { month: "Apr", production: 500, target: 460 },
    { month: "May", production: 480, target: 480 },
    { month: "Jun", production: 550, target: 500 },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg mb-1">Production Overview</h3>
          <p className="text-sm text-gray-500">Monthly crop yield (tons)</p>
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>Last 6 months</option>
          <option>Last year</option>
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis key="xaxis" dataKey="month" stroke="#9ca3af" />
          <YAxis key="yaxis" stroke="#9ca3af" />
          <Tooltip key="tooltip" />
          <Legend key="legend" />
          <Line 
            key="line-production"
            type="monotone" 
            dataKey="production" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Actual Production"
          />
          <Line 
            key="line-target"
            type="monotone" 
            dataKey="target" 
            stroke="#6366f1" 
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Target"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}