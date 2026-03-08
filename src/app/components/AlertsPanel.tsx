import { AlertTriangle, Info, AlertCircle } from "lucide-react";

export function AlertsPanel() {
  const alerts = [
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Low Soil Moisture",
      description: "Field C moisture below 50%",
      time: "2 hours ago",
    },
    {
      type: "info",
      icon: Info,
      title: "Scheduled Irrigation",
      description: "Field A irrigation at 6:00 PM",
      time: "4 hours ago",
    },
    {
      type: "error",
      icon: AlertCircle,
      title: "Equipment Maintenance",
      description: "Tractor #3 needs service",
      time: "1 day ago",
    },
    {
      type: "info",
      icon: Info,
      title: "Weather Update",
      description: "Rain forecast for tomorrow",
      time: "1 day ago",
    },
  ];

  const typeStyles = {
    warning: {
      bg: "bg-orange-100",
      text: "text-orange-600",
      border: "border-orange-200",
    },
    info: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-600",
      border: "border-red-200",
    },
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg">Recent Alerts</h3>
        <button className="text-sm text-green-600 hover:text-green-700">View All</button>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const styles = typeStyles[alert.type as keyof typeof typeStyles];
          return (
            <div
              key={index}
              className={`border ${styles.border} rounded-lg p-4`}
            >
              <div className="flex items-start gap-3">
                <div className={`${styles.bg} rounded-lg p-2 flex-shrink-0`}>
                  <alert.icon className={`w-4 h-4 ${styles.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm mb-1">{alert.title}</h4>
                  <p className="text-xs text-gray-500 mb-1">{alert.description}</p>
                  <p className="text-xs text-gray-400">{alert.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
