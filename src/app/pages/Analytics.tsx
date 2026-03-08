import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, Activity, Target } from "lucide-react";

export function Analytics() {
  const revenueData = [
    { month: "Jan", revenue: 42000, expenses: 28000, profit: 14000 },
    { month: "Feb", revenue: 48000, expenses: 30000, profit: 18000 },
    { month: "Mar", revenue: 45000, expenses: 29000, profit: 16000 },
    { month: "Apr", revenue: 52000, expenses: 31000, profit: 21000 },
    { month: "May", revenue: 58000, expenses: 33000, profit: 25000 },
    { month: "Jun", revenue: 62000, expenses: 35000, profit: 27000 },
  ];

  const cropDistribution = [
    { name: "Wheat", value: 35, color: "#f59e0b" },
    { name: "Corn", value: 28, color: "#10b981" },
    { name: "Tomatoes", value: 20, color: "#ef4444" },
    { name: "Soybeans", value: 17, color: "#8b5cf6" },
  ];

  const yieldComparison = [
    { crop: "Wheat", current: 85, previous: 78 },
    { crop: "Corn", current: 92, previous: 88 },
    { crop: "Tomatoes", current: 76, previous: 82 },
    { crop: "Soybeans", current: 88, previous: 85 },
  ];

  const kpis = [
    {
      label: "Total Revenue",
      value: "$307K",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "green",
    },
    {
      label: "Avg Yield Efficiency",
      value: "85.3%",
      change: "+3.2%",
      trend: "up",
      icon: Activity,
      color: "blue",
    },
    {
      label: "Production Cost",
      value: "$186K",
      change: "-5.8%",
      trend: "down",
      icon: Target,
      color: "purple",
    },
    {
      label: "Profit Margin",
      value: "39.4%",
      change: "+8.1%",
      trend: "up",
      icon: TrendingUp,
      color: "orange",
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl mb-2">Analytics & Insights</h1>
        <p className="text-gray-500">Comprehensive farm performance analysis</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className={`w-12 h-12 bg-${kpi.color}-100 rounded-lg flex items-center justify-center mb-4`}>
              <kpi.icon className={`w-6 h-6 text-${kpi.color}-600`} />
            </div>
            <h3 className="text-2xl mb-1">{kpi.value}</h3>
            <p className="text-sm text-gray-500 mb-2">{kpi.label}</p>
            <p className={`text-xs ${kpi.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {kpi.change} from last period
            </p>
          </div>
        ))}
      </div>

      {/* Revenue & Profit Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Revenue & Profit Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
              <Area type="monotone" dataKey="profit" stroke="#3b82f6" fillOpacity={1} fill="url(#colorProfit)" name="Profit" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Crop Distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg mb-4">Crop Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={cropDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} ${entry.value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {cropDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Yield Comparison */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg mb-4">Yield Comparison: Current vs Previous Season</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={yieldComparison}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="crop" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip />
            <Legend />
            <Bar dataKey="current" fill="#10b981" name="Current Season" radius={[4, 4, 0, 0]} />
            <Bar dataKey="previous" fill="#94a3b8" name="Previous Season" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
