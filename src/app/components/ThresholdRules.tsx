import { Zap, ArrowRight } from "lucide-react";

export function ThresholdRules() {
  // Based on ERD: THRESHOLDS_RULES table (rule_id, sensor_device_id, actuator_device_id, condition, threshold_value, action)
  const rules = [
    {
      rule_id: "RULE001",
      sensor: "Soil Moisture Sensor A1",
      sensor_id: "DEV001",
      condition: "less than",
      threshold: "50%",
      action: "Open Valve",
      actuator: "Irrigation Valve A1",
      actuator_id: "DEV003",
      status: "active",
    },
    {
      rule_id: "RULE002",
      sensor: "Temperature Sensor A2",
      sensor_id: "DEV002",
      condition: "greater than",
      threshold: "30°C",
      action: "Start Cooling",
      actuator: "Cooling System A1",
      actuator_id: "DEV007",
      status: "active",
    },
    {
      rule_id: "RULE003",
      sensor: "Humidity Sensor B1",
      sensor_id: "DEV005",
      condition: "less than",
      threshold: "40%",
      action: "Enable Misting",
      actuator: "Mist System B1",
      actuator_id: "DEV008",
      status: "active",
    },
    {
      rule_id: "RULE004",
      sensor: "Soil Moisture Sensor B2",
      sensor_id: "DEV009",
      condition: "greater than",
      threshold: "80%",
      action: "Close Valve",
      actuator: "Pump Controller B1",
      actuator_id: "DEV006",
      status: "paused",
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg mb-1">Automation Rules</h3>
          <p className="text-sm text-gray-500">Threshold-based device automation</p>
        </div>
        <button className="text-sm text-green-600 hover:text-green-700">+ Add Rule</button>
      </div>

      <div className="space-y-4">
        {rules.map((rule) => (
          <div
            key={rule.rule_id}
            className={`border rounded-lg p-4 ${
              rule.status === "active" ? "border-gray-200 bg-white" : "border-gray-200 bg-gray-50 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Rule ID: {rule.rule_id}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      rule.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
              {/* Sensor (Trigger) */}
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Sensor</p>
                <p className="text-sm font-medium mb-1">{rule.sensor}</p>
                <p className="text-xs text-gray-500">ID: {rule.sensor_id}</p>
              </div>

              {/* Condition */}
              <div className="text-center">
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Condition</p>
                  <p className="text-sm font-medium">{rule.condition}</p>
                  <p className="text-lg font-semibold text-orange-600">{rule.threshold}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 mx-auto mt-2" />
              </div>

              {/* Actuator (Action) */}
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Action</p>
                <p className="text-sm font-medium mb-1">{rule.action}</p>
                <p className="text-xs text-gray-500">Target: {rule.actuator}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
