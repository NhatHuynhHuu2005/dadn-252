import { Thermometer, Droplets, Wind, Sun } from "lucide-react";

export function EnvironmentalMetrics() {
  const metrics = [
    {
      label: "Temperature",
      value: "24°C",
      status: "Optimal",
      icon: Thermometer,
      statusColor: "green",
      details: [
        { label: "Min", value: "18°C" },
        { label: "Max", value: "28°C" },
      ],
    },
    {
      label: "Soil Moisture",
      value: "68%",
      status: "Good",
      icon: Droplets,
      statusColor: "blue",
      details: [
        { label: "Field A", value: "72%" },
        { label: "Field B", value: "64%" },
      ],
    },
    {
      label: "Wind Speed",
      value: "12 km/h",
      status: "Normal",
      icon: Wind,
      statusColor: "cyan",
      details: [
        { label: "Direction", value: "NE" },
        { label: "Gust", value: "18 km/h" },
      ],
    },
    {
      label: "UV Index",
      value: "6",
      status: "High",
      icon: Sun,
      statusColor: "orange",
      details: [
        { label: "Peak", value: "12:00 PM" },
        { label: "Level", value: "Moderate" },
      ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => (
        <div key={metric.label} className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-10 h-10 bg-${metric.statusColor}-100 rounded-lg flex items-center justify-center`}>
              <metric.icon className={`w-5 h-5 text-${metric.statusColor}-600`} />
            </div>
            <span className={`text-xs px-2 py-1 bg-${metric.statusColor}-100 text-${metric.statusColor}-700 rounded`}>
              {metric.status}
            </span>
          </div>
          
          <h3 className="text-2xl mb-1">{metric.value}</h3>
          <p className="text-sm text-gray-500 mb-4">{metric.label}</p>
          
          <div className="space-y-2">
            {metric.details.map((detail) => (
              <div key={detail.label} className="flex justify-between text-xs">
                <span className="text-gray-500">{detail.label}</span>
                <span className="text-gray-700">{detail.value}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
