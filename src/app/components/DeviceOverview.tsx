import { Radio, Gauge, Droplets, Thermometer, Wind, Sun, Activity } from "lucide-react";

export function DeviceOverview() {
  // Based on ERD: DEVICES table with device_id, field_id, name, type, gateway_id, dev_id, offline
  const devices = [
    {
      device_id: "DEV001",
      name: "Soil Moisture Sensor A1",
      type: "sensor",
      gateway_id: "GW001",
      field: "Field A",
      status: "online",
      lastReading: "68%",
      icon: Droplets,
      color: "blue",
    },
    {
      device_id: "DEV002",
      name: "Temperature Sensor A2",
      type: "sensor",
      gateway_id: "GW001",
      field: "Field A",
      status: "online",
      lastReading: "24°C",
      icon: Thermometer,
      color: "orange",
    },
    {
      device_id: "DEV003",
      name: "Irrigation Valve A1",
      type: "actuator",
      gateway_id: "GW001",
      field: "Field A",
      status: "online",
      lastReading: "Closed",
      icon: Gauge,
      color: "green",
    },
    {
      device_id: "DEV004",
      name: "Weather Station Main",
      type: "sensor",
      gateway_id: "GW002",
      field: "Central",
      status: "online",
      lastReading: "Active",
      icon: Sun,
      color: "yellow",
    },
    {
      device_id: "DEV005",
      name: "Humidity Sensor B1",
      type: "sensor",
      gateway_id: "GW001",
      field: "Field B",
      status: "online",
      lastReading: "65%",
      icon: Wind,
      color: "cyan",
    },
    {
      device_id: "DEV006",
      name: "Pump Controller B1",
      type: "actuator",
      gateway_id: "GW001",
      field: "Field B",
      status: "offline",
      lastReading: "Off",
      icon: Activity,
      color: "purple",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {devices.map((device) => (
        <div
          key={device.device_id}
          className={`bg-white rounded-lg border ${
            device.status === "offline" ? "border-red-200" : "border-gray-200"
          } p-4`}
        >
          <div className="flex items-start justify-between mb-3">
            <div className={`w-10 h-10 bg-${device.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
              <device.icon className={`w-5 h-5 text-${device.color}-600`} />
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  device.status === "online" ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <span className="text-xs text-gray-500">{device.status}</span>
            </div>
          </div>
          
          <h3 className="text-sm mb-1">{device.name}</h3>
          <p className="text-xs text-gray-500 mb-3">
            {device.field} • {device.type === "sensor" ? "Sensor" : "Actuator"}
          </p>
          
          <div className="flex items-center justify-between text-xs bg-gray-50 rounded px-3 py-2">
            <span className="text-gray-500">Gateway</span>
            <span className="font-mono">{device.gateway_id}</span>
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs bg-gray-50 rounded px-3 py-2">
            <span className="text-gray-500">Last Reading</span>
            <span className="font-medium">{device.lastReading}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
