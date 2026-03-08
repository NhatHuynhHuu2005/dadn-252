import { Sprout, Plus, Filter, Search, ChevronRight } from "lucide-react";

export function Crops() {
  const crops = [
    {
      id: 1,
      name: "Winter Wheat",
      field: "Field A",
      area: "12.5 hectares",
      planted: "Jan 15, 2026",
      status: "Flowering",
      health: 92,
      expectedHarvest: "Apr 20, 2026",
      variety: "Hard Red Winter",
    },
    {
      id: 2,
      name: "Sweet Corn",
      field: "Field B",
      area: "8.3 hectares",
      planted: "Feb 1, 2026",
      status: "Vegetative",
      health: 88,
      expectedHarvest: "May 15, 2026",
      variety: "Golden Bantam",
    },
    {
      id: 3,
      name: "Cherry Tomatoes",
      field: "Field C",
      area: "5.2 hectares",
      planted: "Feb 10, 2026",
      status: "Early Growth",
      health: 76,
      expectedHarvest: "May 1, 2026",
      variety: "Sun Gold",
    },
    {
      id: 4,
      name: "Soybeans",
      field: "Field D",
      area: "15.8 hectares",
      planted: "Jan 20, 2026",
      status: "Flowering",
      health: 90,
      expectedHarvest: "Apr 25, 2026",
      variety: "Asgrow AG4632",
    },
    {
      id: 5,
      name: "Lettuce",
      field: "Greenhouse 1",
      area: "0.8 hectares",
      planted: "Feb 25, 2026",
      status: "Growing",
      health: 95,
      expectedHarvest: "Mar 25, 2026",
      variety: "Buttercrunch",
    },
  ];

  const getHealthColor = (health: number) => {
    if (health >= 85) return "text-green-600 bg-green-100";
    if (health >= 70) return "text-orange-600 bg-orange-100";
    return "text-red-600 bg-red-100";
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-2">Crop Management</h1>
          <p className="text-gray-500">Monitor and manage all crops across your fields</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-5 h-5" />
          Add New Crop
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Filter className="w-5 h-5" />
            Filter
          </button>
          <select className="px-4 py-2 border border-gray-300 rounded-lg">
            <option>All Fields</option>
            <option>Field A</option>
            <option>Field B</option>
            <option>Field C</option>
            <option>Field D</option>
          </select>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {crops.map((crop) => (
          <div key={crop.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sprout className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg mb-1">{crop.name}</h3>
                  <p className="text-sm text-gray-500">{crop.variety}</p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Health Status */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Health Score</span>
                <span className={`text-sm px-2 py-1 rounded ${getHealthColor(crop.health)}`}>
                  {crop.health}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    crop.health >= 85
                      ? "bg-green-500"
                      : crop.health >= 70
                      ? "bg-orange-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${crop.health}%` }}
                />
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Field</p>
                <p className="text-sm">{crop.field}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Area</p>
                <p className="text-sm">{crop.area}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Planted</p>
                <p className="text-sm">{crop.planted}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Status</p>
                <p className="text-sm">{crop.status}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1">Expected Harvest</p>
                <p className="text-sm">{crop.expectedHarvest}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
