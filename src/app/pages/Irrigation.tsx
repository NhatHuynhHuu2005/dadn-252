import { Droplets, Power, Clock, Settings as SettingsIcon } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function Irrigation() {
  const systems = [
    {
      id: 1,
      name: "Field A - Zone 1",
      status: "Active",
      flow: "250 L/min",
      pressure: "3.5 bar",
      duration: "45 min remaining",
      schedule: "Daily at 6:00 AM & 6:00 PM",
      mode: "Automatic",
    },
    {
      id: 2,
      name: "Field B - Zone 2",
      status: "Scheduled",
      flow: "0 L/min",
      pressure: "0 bar",
      duration: "Starts in 3h 15m",
      schedule: "Daily at 6:00 AM & 6:00 PM",
      mode: "Automatic",
    },
    {
      id: 3,
      name: "Field C - Zone 3",
      status: "Active",
      flow: "180 L/min",
      pressure: "3.2 bar",
      duration: "20 min remaining",
      schedule: "Every 2 days at 7:00 AM",
      mode: "Automatic",
    },
    {
      id: 4,
      name: "Greenhouse 1",
      status: "Idle",
      flow: "0 L/min",
      pressure: "0 bar",
      duration: "Manual control",
      schedule: "On-demand",
      mode: "Manual",
    },
  ];

  const waterUsageData = [
    { time: "00:00", usage: 120 },
    { time: "04:00", usage: 150 },
    { time: "06:00", usage: 380 },
    { time: "08:00", usage: 280 },
    { time: "12:00", usage: 200 },
    { time: "16:00", usage: 180 },
    { time: "18:00", usage: 420 },
    { time: "20:00", usage: 250 },
    { time: "23:59", usage: 140 },
  ];

  const statusColors: { [key: string]: string } = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Scheduled: "bg-blue-100 text-blue-700 border-blue-200",
    Idle: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-2">Irrigation Management</h1>
          <p className="text-gray-500">Monitor and control irrigation systems</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <SettingsIcon className="w-5 h-5" />
          Configure Systems
        </button>
      </div>

      {/* Water Usage Chart */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg mb-4">Today's Water Usage</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={waterUsageData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" label={{ value: 'Liters/min', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Line type="monotone" dataKey="usage" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Droplets className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-2xl mb-1">2,845L</h3>
          <p className="text-sm text-gray-500">Total Today</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Power className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-2xl mb-1">2/4</h3>
          <p className="text-sm text-gray-500">Active Systems</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl mb-1">3.5h</h3>
          <p className="text-sm text-gray-500">Total Runtime</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
            <Droplets className="w-6 h-6 text-orange-600" />
          </div>
          <h3 className="text-2xl mb-1">92%</h3>
          <p className="text-sm text-gray-500">Efficiency</p>
        </div>
      </div>

      {/* Irrigation Systems */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systems.map((system) => (
          <div key={system.id} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg mb-2">{system.name}</h3>
                <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[system.status]}`}>
                  {system.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Power className="w-5 h-5 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <SettingsIcon className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Flow Rate</span>
                <span className="text-sm">{system.flow}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Pressure</span>
                <span className="text-sm">{system.pressure}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Duration</span>
                <span className="text-sm">{system.duration}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Schedule</span>
                <span className="text-sm">{system.schedule}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Mode</span>
                <span className="text-sm">{system.mode}</span>
              </div>
            </div>

            {system.status === "Active" && (
              <button className="w-full mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100">
                Stop Irrigation
              </button>
            )}
            {system.status === "Idle" && (
              <button className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Start Irrigation
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
