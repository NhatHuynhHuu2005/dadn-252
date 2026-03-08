import { TrendingUp, TrendingDown, Droplets, Thermometer, Wind, Sprout } from "lucide-react";

export function QuickStats() {
  const stats = [
    {
      label: "Active Fields",
      value: "24",
      change: "+2 this month",
      trend: "up",
      icon: Sprout,
      color: "green",
    },
    {
      label: "Avg Temperature",
      value: "24°C",
      change: "+2°C from yesterday",
      trend: "up",
      icon: Thermometer,
      color: "orange",
    },
    {
      label: "Water Usage",
      value: "1,245L",
      change: "-8% this week",
      trend: "down",
      icon: Droplets,
      color: "blue",
    },
    {
      label: "Humidity",
      value: "65%",
      change: "+5% optimal range",
      trend: "up",
      icon: Wind,
      color: "cyan",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
            {stat.trend === "up" ? (
              <TrendingUp className="w-5 h-5 text-green-500" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-500" />
            )}
          </div>
          <h3 className="text-2xl mb-1">{stat.value}</h3>
          <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
          <p className="text-xs text-gray-400">{stat.change}</p>
        </div>
      ))}
    </div>
  );
}
