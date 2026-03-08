import { Calendar as CalendarIcon, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";

export function Schedule() {
  const events = [
    {
      id: 1,
      title: "Irrigation - Field A",
      time: "6:00 AM",
      duration: "1 hour",
      type: "irrigation",
      status: "completed",
    },
    {
      id: 2,
      title: "Fertilizer Application - Field B",
      time: "9:00 AM",
      duration: "2 hours",
      type: "fertilizer",
      status: "in-progress",
    },
    {
      id: 3,
      title: "Pest Inspection - Field C",
      time: "2:00 PM",
      duration: "1 hour",
      type: "inspection",
      status: "scheduled",
    },
    {
      id: 4,
      title: "Irrigation - Field B",
      time: "6:00 PM",
      duration: "1 hour",
      type: "irrigation",
      status: "scheduled",
    },
  ];

  const upcomingTasks = [
    {
      date: "Mar 8, 2026",
      tasks: [
        { title: "Harvest Field A - Wheat", time: "7:00 AM" },
        { title: "Soil Testing - Field D", time: "10:00 AM" },
      ],
    },
    {
      date: "Mar 9, 2026",
      tasks: [
        { title: "Equipment Maintenance", time: "8:00 AM" },
        { title: "Irrigation System Check", time: "2:00 PM" },
      ],
    },
    {
      date: "Mar 10, 2026",
      tasks: [
        { title: "Fertilizer Delivery", time: "All Day" },
      ],
    },
  ];

  const typeColors: { [key: string]: string } = {
    irrigation: "bg-blue-100 text-blue-700 border-blue-200",
    fertilizer: "bg-green-100 text-green-700 border-green-200",
    inspection: "bg-purple-100 text-purple-700 border-purple-200",
  };

  const statusColors: { [key: string]: string } = {
    completed: "bg-gray-100 text-gray-600",
    "in-progress": "bg-green-100 text-green-600",
    scheduled: "bg-blue-100 text-blue-600",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl mb-2">Schedule & Calendar</h1>
          <p className="text-gray-500">Manage farm activities and tasks</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl">Today - March 7, 2026</h2>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{event.time}</span>
                        <span className="text-sm text-gray-400">• {event.duration}</span>
                      </div>
                      <h3 className="text-lg mb-2">{event.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded border ${typeColors[event.type]}`}>
                          {event.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${statusColors[event.status]}`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar View Wireframe */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg mb-4">March 2026</h3>
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm text-gray-500 py-2">
                  {day}
                </div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2; // Starting from day 1 on Wednesday
                const isToday = day === 7;
                const hasEvent = [8, 9, 10, 15, 20].includes(day);
                
                return (
                  <div
                    key={i}
                    className={`aspect-square border border-gray-200 rounded-lg p-2 text-sm ${
                      day < 1 || day > 31
                        ? "bg-gray-50 text-gray-300"
                        : isToday
                        ? "bg-green-100 border-green-500 font-semibold"
                        : "hover:bg-gray-50 cursor-pointer"
                    }`}
                  >
                    {day > 0 && day <= 31 && (
                      <>
                        <div>{day}</div>
                        {hasEvent && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1 mx-auto" />
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Upcoming Tasks Sidebar */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg mb-4">Upcoming Tasks</h3>
            <div className="space-y-4">
              {upcomingTasks.map((day, index) => (
                <div key={index}>
                  <p className="text-sm font-medium text-gray-900 mb-2">{day.date}</p>
                  <div className="space-y-2">
                    {day.tasks.map((task, taskIndex) => (
                      <div
                        key={taskIndex}
                        className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50"
                      >
                        <p className="text-sm mb-1">{task.title}</p>
                        <p className="text-xs text-gray-500">{task.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
            <h3 className="text-lg mb-4">This Week</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Tasks</span>
                <span className="text-lg font-semibold">12</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Completed</span>
                <span className="text-lg font-semibold text-green-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">In Progress</span>
                <span className="text-lg font-semibold text-blue-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Scheduled</span>
                <span className="text-lg font-semibold text-gray-600">2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
