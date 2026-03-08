import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export function WaterUsageChart() {
  const data = [
    { day: "Mon", usage: 1200, optimal: 1000 },
    { day: "Tue", usage: 980, optimal: 1000 },
    { day: "Wed", usage: 1100, optimal: 1000 },
    { day: "Thu", usage: 950, optimal: 1000 },
    { day: "Fri", usage: 1050, optimal: 1000 },
    { day: "Sat", usage: 900, optimal: 1000 },
    { day: "Sun", usage: 850, optimal: 1000 },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg mb-1">Water Usage</h3>
          <p className="text-sm text-gray-500">Daily consumption (liters)</p>
        </div>
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>This week</option>
          <option>Last week</option>
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis key="xaxis" dataKey="day" stroke="#9ca3af" />
          <YAxis key="yaxis" stroke="#9ca3af" />
          <Tooltip key="tooltip" />
          <Legend key="legend" />
          <Bar key="bar-usage" dataKey="usage" fill="#3b82f6" name="Actual Usage" radius={[4, 4, 0, 0]} />
          <Bar key="bar-optimal" dataKey="optimal" fill="#e5e7eb" name="Optimal Range" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}