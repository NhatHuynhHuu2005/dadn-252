import { EnvironmentalMetrics } from "../components/EnvironmentalMetrics";
import { CropHealth } from "../components/CropHealth";
import { EquipmentStatus } from "../components/EquipmentStatus";
import { ProductionChart } from "../components/ProductionChart";
import { WaterUsageChart } from "../components/WaterUsageChart";
import { AlertsPanel } from "../components/AlertsPanel";
import { QuickStats } from "../components/QuickStats";
import { DeviceOverview } from "../components/DeviceOverview";
import { ThresholdRules } from "../components/ThresholdRules";

export function Dashboard() {
  return (
    <>
      {/* Quick Stats */}
      <QuickStats />
      
      {/* Device Overview - Based on ERD DEVICES table */}
      <section className="mb-6">
        <h2 className="text-xl mb-4">Device Status</h2>
        <DeviceOverview />
      </section>
      
      {/* Environmental Metrics - Based on ERD SENSOR_DATA */}
      <section className="mb-6">
        <h2 className="text-xl mb-4">Live Sensor Readings</h2>
        <EnvironmentalMetrics />
      </section>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProductionChart />
        <WaterUsageChart />
      </div>
      
      {/* Threshold Rules & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ThresholdRules />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>
      
      {/* Fields & Crops - Based on ERD FIELDS table */}
      <CropHealth />
    </>
  );
}