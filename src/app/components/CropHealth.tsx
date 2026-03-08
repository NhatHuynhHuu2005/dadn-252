import { Sprout, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function CropHealth() {
  const fields = [
    {
      name: "Field A - Wheat",
      status: "Healthy",
      statusColor: "green",
      icon: CheckCircle,
      progress: 85,
      details: {
        planted: "Jan 15, 2026",
        harvest: "Apr 20, 2026",
        stage: "Flowering",
      },
    },
    {
      name: "Field B - Corn",
      status: "Growing",
      statusColor: "blue",
      icon: Clock,
      progress: 65,
      details: {
        planted: "Feb 1, 2026",
        harvest: "May 15, 2026",
        stage: "Vegetative",
      },
    },
    {
      name: "Field C - Tomatoes",
      status: "Attention",
      statusColor: "orange",
      icon: AlertTriangle,
      progress: 55,
      details: {
        planted: "Feb 10, 2026",
        harvest: "May 1, 2026",
        stage: "Early Growth",
      },
    },
    {
      name: "Field D - Soybeans",
      status: "Healthy",
      statusColor: "green",
      icon: CheckCircle,
      progress: 75,
      details: {
        planted: "Jan 20, 2026",
        harvest: "Apr 25, 2026",
        stage: "Flowering",
      },
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg">Crop Health Monitor</h3>
        <button className="text-sm text-green-600 hover:text-green-700">View All</button>
      </div>
      
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 bg-${field.statusColor}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Sprout className={`w-5 h-5 text-${field.statusColor}-600`} />
                </div>
                <div>
                  <h4 className="font-medium mb-1">{field.name}</h4>
                  <div className="flex items-center gap-2">
                    <field.icon className={`w-4 h-4 text-${field.statusColor}-600`} />
                    <span className="text-sm text-gray-600">{field.status}</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">{field.progress}%</div>
            </div>
            
            {/* Progress Bar */}
            <div className="mb-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${field.statusColor}-500 h-2 rounded-full`}
                  style={{ width: `${field.progress}%` }}
                />
              </div>
            </div>
            
            {/* Details */}
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <p className="text-gray-500 mb-1">Planted</p>
                <p className="text-gray-700">{field.details.planted}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Est. Harvest</p>
                <p className="text-gray-700">{field.details.harvest}</p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Stage</p>
                <p className="text-gray-700">{field.details.stage}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
