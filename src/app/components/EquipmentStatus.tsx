import { Truck, Zap, Power, AlertCircle } from "lucide-react";

export function EquipmentStatus() {
  const equipment = [
    {
      name: "Tractor #1",
      status: "Active",
      statusColor: "green",
      location: "Field A",
      battery: 85,
      icon: Truck,
    },
    {
      name: "Irrigation System #2",
      status: "Active",
      statusColor: "green",
      location: "Field B",
      battery: 92,
      icon: Zap,
    },
    {
      name: "Tractor #3",
      status: "Maintenance",
      statusColor: "orange",
      location: "Workshop",
      battery: 45,
      icon: Truck,
    },
    {
      name: "Sprayer #1",
      status: "Idle",
      statusColor: "gray",
      location: "Storage",
      battery: 100,
      icon: Power,
    },
    {
      name: "Harvester #1",
      status: "Active",
      statusColor: "green",
      location: "Field D",
      battery: 78,
      icon: Truck,
    },
    {
      name: "Drone #2",
      status: "Charging",
      statusColor: "blue",
      location: "Charging Station",
      battery: 35,
      icon: Zap,
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg">Equipment Status</h3>
        <button className="text-sm text-green-600 hover:text-green-700">Manage Equipment</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {equipment.map((item) => (
          <div key={item.name} className="border border-gray-200 rounded-lg p-4">
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
                <span className="text-gray-500">Location</span>
                <span className="text-gray-700">{item.location}</span>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-500">Battery</span>
                  <span className="text-gray-700">{item.battery}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`${
                      item.battery > 60
                        ? "bg-green-500"
                        : item.battery > 30
                        ? "bg-orange-500"
                        : "bg-red-500"
                    } h-1.5 rounded-full`}
                    style={{ width: `${item.battery}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
