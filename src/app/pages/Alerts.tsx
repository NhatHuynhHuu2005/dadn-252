import { AlertTriangle, Info, AlertCircle, CheckCircle, Bell, Filter } from "lucide-react";

export function Alerts() {
  const alerts = [
    {
      id: 1,
      type: "warning",
      icon: AlertTriangle,
      title: "Low Soil Moisture Detected",
      description: "Field C soil moisture has dropped below 50%. Immediate irrigation recommended.",
      timestamp: "2 hours ago",
      field: "Field C",
      status: "active",
      priority: "high",
    },
    {
      id: 2,
      type: "error",
      icon: AlertCircle,
      title: "Equipment Maintenance Required",
      description: "Tractor #3 has reached its scheduled maintenance interval. Service required before next use.",
      timestamp: "4 hours ago",
      field: "Workshop",
      status: "active",
      priority: "high",
    },
    {
      id: 3,
      type: "info",
      icon: Info,
      title: "Scheduled Irrigation Starting",
      description: "Automated irrigation for Field A will begin in 30 minutes as scheduled.",
      timestamp: "4 hours ago",
      field: "Field A",
      status: "active",
      priority: "medium",
    },
    {
      id: 4,
      type: "warning",
      icon: AlertTriangle,
      title: "Weather Alert: Heavy Rain",
      description: "Rain forecast for tomorrow (March 8). Consider postponing outdoor activities.",
      timestamp: "6 hours ago",
      field: "All Fields",
      status: "active",
      priority: "medium",
    },
    {
      id: 5,
      type: "success",
      icon: CheckCircle,
      title: "Irrigation Cycle Completed",
      description: "Field B irrigation cycle completed successfully. Total water used: 850L.",
      timestamp: "8 hours ago",
      field: "Field B",
      status: "resolved",
      priority: "low",
    },
    {
      id: 6,
      type: "info",
      icon: Info,
      title: "Sensor Battery Low",
      description: "Soil moisture sensor in Field D battery at 15%. Replacement recommended within 48 hours.",
      timestamp: "1 day ago",
      field: "Field D",
      status: "active",
      priority: "medium",
    },
    {
      id: 7,
      type: "success",
      icon: CheckCircle,
      title: "Pest Inspection Completed",
      description: "Routine pest inspection for Field A completed. No issues detected.",
      timestamp: "1 day ago",
      field: "Field A",
      status: "resolved",
      priority: "low",
    },
    {
      id: 8,
      type: "warning",
      icon: AlertTriangle,
      title: "Temperature Spike",
      description: "Field C temperature reached 32°C. Monitor crop stress levels.",
      timestamp: "2 days ago",
      field: "Field C",
      status: "resolved",
      priority: "medium",
    },
  ];

  const typeStyles: { [key: string]: any } = {
    warning: {
      bg: "bg-orange-50",
      border: "border-orange-200",
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
  };

  const activeAlerts = alerts.filter((a) => a.status === "active");
  const resolvedAlerts = alerts.filter((a) => a.status === "resolved");

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-2">Alerts & Notifications</h1>
          <p className="text-gray-500">Monitor and manage farm alerts</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-2xl mb-1">{activeAlerts.filter((a) => a.priority === "high").length}</h3>
          <p className="text-sm text-gray-500">High Priority</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-2xl mb-1">{activeAlerts.filter((a) => a.priority === "medium").length}</h3>
          <p className="text-sm text-gray-500">Medium Priority</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Info className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl mb-1">{activeAlerts.length}</h3>
          <p className="text-sm text-gray-500">Active Alerts</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl mb-1">{resolvedAlerts.length}</h3>
          <p className="text-sm text-gray-500">Resolved Today</p>
        </div>
      </div>

      {/* Active Alerts */}
      <div className="mb-6">
        <h2 className="text-xl mb-4">Active Alerts</h2>
        <div className="space-y-4">
          {activeAlerts.map((alert) => {
            const styles = typeStyles[alert.type];
            return (
              <div
                key={alert.id}
                className={`${styles.bg} border ${styles.border} rounded-lg p-6`}
              >
                <div className="flex items-start gap-4">
                  <div className={`${styles.iconBg} rounded-lg p-3 flex-shrink-0`}>
                    <alert.icon className={`w-6 h-6 ${styles.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg mb-1">{alert.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                      </div>
                      <span className="text-xs px-3 py-1 bg-white rounded-full border border-gray-300 flex-shrink-0 ml-4">
                        {alert.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{alert.field}</span>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                      View Details
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resolved Alerts */}
      <div>
        <h2 className="text-xl mb-4">Recently Resolved</h2>
        <div className="space-y-3">
          {resolvedAlerts.map((alert) => {
            const styles = typeStyles[alert.type];
            return (
              <div
                key={alert.id}
                className="bg-white border border-gray-200 rounded-lg p-4 opacity-75"
              >
                <div className="flex items-start gap-4">
                  <div className={`${styles.iconBg} rounded-lg p-2 flex-shrink-0`}>
                    <alert.icon className={`w-5 h-5 ${styles.iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm mb-1">{alert.title}</h3>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{alert.field}</span>
                      <span>•</span>
                      <span>{alert.timestamp}</span>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
