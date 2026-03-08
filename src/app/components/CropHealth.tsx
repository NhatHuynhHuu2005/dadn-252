import { Sprout, AlertTriangle, CheckCircle, Clock } from "lucide-react";

export function CropHealth() {
  // Updated to match ERD: FIELDS table (field_id, user_id, name, area)
  const fields = [
    {
      field_id: "FLD001",
      name: "Field A - Wheat",
      user_id: "USR001",
      area: "12.5 ha",
      status: "Healthy",
      statusColor: "green",
      icon: CheckCircle,
      deviceCount: 5,
      details: {
        planted: "Jan 15, 2026",
        harvest: "Apr 20, 2026",
        stage: "Flowering",
      },
    },
    {
      field_id: "FLD002",
      name: "Field B - Corn",
      user_id: "USR001",
      area: "8.3 ha",
      status: "Growing",
      statusColor: "blue",
      icon: Clock,
      deviceCount: 3,
      details: {
        planted: "Feb 1, 2026",
        harvest: "May 15, 2026",
        stage: "Vegetative",
      },
    },
    {
      field_id: "FLD003",
      name: "Field C - Tomatoes",
      user_id: "USR001",
      area: "5.2 ha",
      status: "Attention",
      statusColor: "orange",
      icon: AlertTriangle,
      deviceCount: 4,
      details: {
        planted: "Feb 10, 2026",
        harvest: "May 1, 2026",
        stage: "Early Growth",
      },
    },
    {
      field_id: "FLD004",
      name: "Field D - Soybeans",
      user_id: "USR001",
      area: "15.8 ha",
      status: "Healthy",
      statusColor: "green",
      icon: CheckCircle,
      deviceCount: 6,
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
        <h3 className="text-lg">Fields Overview</h3>
        <button className="text-sm text-green-600 hover:text-green-700">View All</button>
      </div>
      
      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.field_id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 bg-${field.statusColor}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Sprout className={`w-5 h-5 text-${field.statusColor}-600`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{field.name}</h4>
                    <span className="text-xs text-gray-500 font-mono">({field.field_id})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <field.icon className={`w-4 h-4 text-${field.statusColor}-600`} />
                    <span className="text-sm text-gray-600">{field.status}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{field.area}</p>
                <p className="text-xs text-gray-500">{field.deviceCount} devices</p>
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