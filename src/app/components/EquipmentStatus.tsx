import { Truck, Zap, Power, AlertCircle, Radio } from "lucide-react";

export function EquipmentStatus() {
  // Updated to match ERD: DEVICES table structure
  const equipment = [
    {
      device_id: "DEV001",
      name: "Soil Sensor A1",
      type: "sensor",
      status: "Active",
      statusColor: "green",
      location: "Field A",
      gateway: "GW001",
      icon: Zap,
    },
    {
      device_id: "DEV003",
      name: "Irrigation Valve A1",
      type: "actuator",
      status: "Active",
      statusColor: "green",
      location: "Field A",
      gateway: "GW001",
      icon: Power,
    },
    {
      device_id: "DEV006",
      name: "Pump Controller B1",
      type: "actuator",
      status: "Offline",
      statusColor: "red",
      location: "Field B",
      gateway: "GW001",
      icon: Power,
    },
    {
      device_id: "DEV002",
      name: "Temperature Sensor A2",
      type: "sensor",
      status: "Active",
      statusColor: "green",
      location: "Field A",
      gateway: "GW001",
      icon: Zap,
    },
    {
      device_id: "DEV004",
      name: "Weather Station Main",
      type: "sensor",
      status: "Active",
      statusColor: "green",
      location: "Central",
      gateway: "GW002",
      icon: Radio,
    },
    {
      device_id: "DEV005",
      name: "Humidity Sensor B1",
      type: "sensor",
      status: "Active",
      statusColor: "green",
      location: "Field B",
      gateway: "GW001",
      icon: Zap,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg">All Devices</h3>
        <button className="text-sm text-green-600 hover:text-green-700">Manage Devices</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item) => (
          <div key={item.device_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${item.statusColor}-100 rounded-lg flex items-center justify-center`}>
                  <item.icon className={`w-5 h-5 text-${item.statusColor}-600`} />
                </div>
                <div>
                  <h4 className="text-sm mb-1">{item.name}</h4>
                  <span
                    className={`text-xs px-2 py-1 bg-${item.statusColor}-100 text-${item.statusColor}-700 rounded`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Device ID</span>
                <span className="text-gray-700 font-mono">{item.device_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Type</span>
                <span className="text-gray-700 capitalize">{item.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="text-gray-700">{item.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Gateway</span>
                <span className="text-gray-700 font-mono">{item.gateway}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}