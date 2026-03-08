import { MapPin, Maximize2, Layers, Navigation } from "lucide-react";

export function FieldMap() {
  const fields = [
    { id: "A", name: "Field A - Wheat", color: "#fbbf24", acres: "12.5 ha" },
    { id: "B", name: "Field B - Corn", color: "#10b981", acres: "8.3 ha" },
    { id: "C", name: "Field C - Tomatoes", color: "#ef4444", acres: "5.2 ha" },
    { id: "D", name: "Field D - Soybeans", color: "#8b5cf6", acres: "15.8 ha" },
  ];

  const sensors = [
    { id: 1, field: "A", type: "Soil Moisture", value: "72%", status: "normal" },
    { id: 2, field: "A", type: "Temperature", value: "24°C", status: "normal" },
    { id: 3, field: "B", type: "Soil Moisture", value: "64%", status: "normal" },
    { id: 4, field: "C", type: "Soil Moisture", value: "48%", status: "warning" },
    { id: 5, field: "D", type: "Temperature", value: "26°C", status: "normal" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-2">Field Map</h1>
          <p className="text-gray-500">Interactive view of your farm layout and sensor locations</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Layers className="w-5 h-5" />
            Layers
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Maximize2 className="w-5 h-5" />
            Full Screen
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            {/* Wireframe Map */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden" style={{ height: "600px" }}>
              {/* Map Controls */}
              <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  +
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  −
                </button>
                <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50">
                  <Navigation className="w-5 h-5" />
                </button>
              </div>

              {/* Wireframe Field Layout */}
              <div className="absolute inset-0 p-12">
                {/* Field A */}
                <div
                  className="absolute border-4 rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: fields[0].color,
                    backgroundColor: fields[0].color + "20",
                    top: "10%",
                    left: "5%",
                    width: "40%",
                    height: "35%",
                  }}
                >
                  <div className="bg-white rounded px-3 py-2 inline-block shadow-sm">
                    <p className="text-sm font-medium">Field A</p>
                    <p className="text-xs text-gray-500">Wheat - 12.5 ha</p>
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                {/* Field B */}
                <div
                  className="absolute border-4 rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: fields[1].color,
                    backgroundColor: fields[1].color + "20",
                    top: "10%",
                    right: "5%",
                    width: "45%",
                    height: "35%",
                  }}
                >
                  <div className="bg-white rounded px-3 py-2 inline-block shadow-sm">
                    <p className="text-sm font-medium">Field B</p>
                    <p className="text-xs text-gray-500">Corn - 8.3 ha</p>
                  </div>
                  <div className="absolute top-1/3 left-1/3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                </div>

                {/* Field C */}
                <div
                  className="absolute border-4 rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: fields[2].color,
                    backgroundColor: fields[2].color + "20",
                    bottom: "10%",
                    left: "5%",
                    width: "35%",
                    height: "40%",
                  }}
                >
                  <div className="bg-white rounded px-3 py-2 inline-block shadow-sm">
                    <p className="text-sm font-medium">Field C</p>
                    <p className="text-xs text-gray-500">Tomatoes - 5.2 ha</p>
                  </div>
                  <div className="absolute top-1/2 left-1/2">
                    <MapPin className="w-6 h-6 text-orange-600" />
                  </div>
                </div>

                {/* Field D */}
                <div
                  className="absolute border-4 rounded-lg p-4 cursor-pointer hover:opacity-80 transition-opacity"
                  style={{
                    borderColor: fields[3].color,
                    backgroundColor: fields[3].color + "20",
                    bottom: "10%",
                    right: "5%",
                    width: "50%",
                    height: "40%",
                  }}
                >
                  <div className="bg-white rounded px-3 py-2 inline-block shadow-sm">
                    <p className="text-sm font-medium">Field D</p>
                    <p className="text-xs text-gray-500">Soybeans - 15.8 ha</p>
                  </div>
                  <div className="absolute top-2/3 left-2/3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Legend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg mb-4">Fields</h3>
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.id} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded border-2"
                    style={{
                      borderColor: field.color,
                      backgroundColor: field.color + "40",
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{field.name}</p>
                    <p className="text-xs text-gray-500">{field.acres}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sensor Data */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg mb-4">Sensor Readings</h3>
            <div className="space-y-3">
              {sensors.map((sensor) => (
                <div key={sensor.id} className="pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">Field {sensor.field}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded ${
                        sensor.status === "normal"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {sensor.status}
                    </span>
                  </div>
                  <p className="text-sm">{sensor.type}</p>
                  <p className="text-sm font-medium">{sensor.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
