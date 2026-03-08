import { useState } from "react";
import { User, Bell, Globe, Shield, Database, Smartphone } from "lucide-react";

type SettingsSection = "Profile" | "Notifications" | "General" | "Security" | "Data & Storage" | "Devices";

export function Settings() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("Profile");

  const menuItems = [
    { icon: User, label: "Profile" as SettingsSection },
    { icon: Bell, label: "Notifications" as SettingsSection },
    { icon: Globe, label: "General" as SettingsSection },
    { icon: Shield, label: "Security" as SettingsSection },
    { icon: Database, label: "Data & Storage" as SettingsSection },
    { icon: Smartphone, label: "Devices" as SettingsSection },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl mb-2">Settings</h1>
        <p className="text-gray-500">Manage your farm preferences and configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveSection(item.label)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.label
                    ? "bg-green-50 text-green-700"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2">
          {activeSection === "Profile" && <ProfileSection />}
          {activeSection === "Notifications" && <NotificationsSection />}
          {activeSection === "General" && <GeneralSection />}
          {activeSection === "Security" && <SecuritySection />}
          {activeSection === "Data & Storage" && <DataStorageSection />}
          {activeSection === "Devices" && <DevicesSection />}
        </div>
      </div>
    </div>
  );
}

function ProfileSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              defaultValue="John Farmer"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <input
              type="email"
              defaultValue="john.farmer@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              defaultValue="+1 (555) 123-4567"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Role</label>
            <input
              type="text"
              defaultValue="Farm Manager"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Farm Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Farm Name</label>
            <input
              type="text"
              defaultValue="Green Valley Farm"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Location</label>
            <input
              type="text"
              defaultValue="Iowa, USA"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Total Area</label>
            <input
              type="text"
              defaultValue="42.6 hectares"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Timezone</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Central Time (CT)</option>
              <option>Eastern Time (ET)</option>
              <option>Pacific Time (PT)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Save Changes
        </button>
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function NotificationsSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Notification Preferences</h2>
        <div className="space-y-4">
          {[
            { label: "Email Notifications", description: "Receive alerts via email", checked: true },
            { label: "SMS Notifications", description: "Receive alerts via text message", checked: true },
            { label: "Push Notifications", description: "Receive alerts on mobile app", checked: false },
            { label: "Weather Alerts", description: "Get notified about weather changes", checked: true },
            { label: "Equipment Alerts", description: "Get notified about equipment status", checked: true },
            { label: "Crop Health Alerts", description: "Get notified about crop health issues", checked: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Alert Thresholds</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Soil Moisture Alert (%)</label>
            <input
              type="number"
              defaultValue="50"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Temperature Alert (°C)</label>
            <input
              type="number"
              defaultValue="35"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Battery Alert (%)</label>
            <input
              type="number"
              defaultValue="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Save Changes
        </button>
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function GeneralSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">General Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Language</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
              <option>German</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Date Format</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>MM/DD/YYYY</option>
              <option>DD/MM/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Temperature Unit</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Celsius (°C)</option>
              <option>Fahrenheit (°F)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Measurement System</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>Metric</option>
              <option>Imperial</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Display Preferences</h2>
        <div className="space-y-4">
          {[
            { label: "Dark Mode", description: "Use dark theme throughout the app", checked: false },
            { label: "Compact View", description: "Show more content in less space", checked: false },
            { label: "Show Weather Widget", description: "Display weather on dashboard", checked: true },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm">{item.label}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Save Changes
        </button>
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function SecuritySection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Two-Factor Authentication</h2>
        <p className="text-sm text-gray-600 mb-4">
          Add an extra layer of security to your account by enabling two-factor authentication.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Enable 2FA
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Active Sessions</h2>
        <div className="space-y-3">
          {[
            { device: "Chrome on Windows", location: "Iowa, USA", time: "Active now" },
            { device: "Safari on iPhone", location: "Iowa, USA", time: "2 hours ago" },
            { device: "Firefox on MacBook", location: "Iowa, USA", time: "1 day ago" },
          ].map((session, index) => (
            <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="text-sm">{session.device}</p>
                <p className="text-xs text-gray-500">
                  {session.location} • {session.time}
                </p>
              </div>
              <button className="text-sm text-red-600 hover:text-red-700">Revoke</button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Update Password
        </button>
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function DataStorageSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Storage Usage</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-700">Total Storage</span>
              <span className="text-sm">3.2 GB / 10 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-500 h-3 rounded-full" style={{ width: "32%" }} />
            </div>
          </div>
          
          <div className="space-y-3 mt-6">
            {[
              { category: "Sensor Data", size: "1.8 GB", percent: 18 },
              { category: "Images", size: "0.9 GB", percent: 9 },
              { category: "Reports", size: "0.3 GB", percent: 3 },
              { category: "Other", size: "0.2 GB", percent: 2 },
            ].map((item) => (
              <div key={item.category} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-sm">{item.category}</span>
                </div>
                <span className="text-sm text-gray-500">{item.size}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Data Retention</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Keep sensor data for</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>3 months</option>
              <option>6 months</option>
              <option>1 year</option>
              <option>Forever</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-2">Auto-delete old reports after</label>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>6 months</option>
              <option>1 year</option>
              <option>2 years</option>
              <option>Never</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Export Data</h2>
        <p className="text-sm text-gray-600 mb-4">
          Download all your farm data in a portable format.
        </p>
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Export All Data
        </button>
      </div>

      <div className="flex gap-4">
        <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Save Changes
        </button>
        <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
      </div>
    </div>
  );
}

function DevicesSection() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Connected Devices</h2>
        <div className="space-y-4">
          {[
            { name: "Soil Sensor #1", type: "Sensor", location: "Field A", status: "Online", battery: 85 },
            { name: "Soil Sensor #2", type: "Sensor", location: "Field B", status: "Online", battery: 92 },
            { name: "Weather Station", type: "Station", location: "Central", status: "Online", battery: 78 },
            { name: "Irrigation Controller #1", type: "Controller", location: "Field A", status: "Online", battery: 100 },
            { name: "Drone #1", type: "Drone", location: "Storage", status: "Offline", battery: 45 },
          ].map((device, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm mb-1">{device.name}</h3>
                  <p className="text-xs text-gray-500">{device.type} • {device.location}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    device.status === "Online"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {device.status}
                </span>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500">Battery</span>
                  <span>{device.battery}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${
                      device.battery > 60 ? "bg-green-500" : device.battery > 30 ? "bg-orange-500" : "bg-red-500"
                    }`}
                    style={{ width: `${device.battery}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg mb-4">Add New Device</h2>
        <p className="text-sm text-gray-600 mb-4">
          Connect a new sensor or device to your farm network.
        </p>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Add Device
        </button>
      </div>
    </div>
  );
}
