import { AlertTriangle, Info, AlertCircle } from "lucide-react";

export function AlertsPanel() {
  // Updated to match ERD: ALERTS table (id, device_id, message, timestamp, resolve_id, is_resolved)
  const alerts = [
    {
      id: "ALT001",
      device_id: "DEV001",
      type: "warning",
      icon: AlertTriangle,
      title: "Low Soil Moisture",
      message: "Soil moisture sensor reading below threshold",
      time: "2 hours ago",
      is_resolved: false,
    },
    {
      id: "ALT002",
      device_id: "DEV006",
      type: "error",
      icon: AlertCircle,
      title: "Device Offline",
      message: "Pump Controller B1 connection lost",
      time: "4 hours ago",
      is_resolved: false,
    },
    {
      id: "ALT003",
      device_id: "DEV003",
      type: "info",
      icon: Info,
      title: "Automation Triggered",
      message: "Irrigation valve opened by Rule RULE001",
      time: "4 hours ago",
      is_resolved: true,
    },
    {
      id: "ALT004",
      device_id: "DEV004",
      type: "info",
      icon: Info,
      title: "Weather Update",
      message: "Rain forecast detected by weather station",
      time: "1 day ago",
      is_resolved: true,
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
        {alerts.map((alert) => {
          const styles = typeStyles[alert.type as keyof typeof typeStyles];
          return (
            <div
              key={alert.id}
              className={`border ${styles.border} rounded-lg p-4 ${
                alert.is_resolved ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`${styles.bg} rounded-lg p-2 flex-shrink-0`}>
                  <alert.icon className={`w-4 h-4 ${styles.text}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm mb-1">{alert.title}</h4>
                  <p className="text-xs text-gray-500 mb-1">{alert.message}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="font-mono">{alert.device_id}</span>
                    <span>•</span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}