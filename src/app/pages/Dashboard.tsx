import { EnvironmentalMetrics } from "../components/EnvironmentalMetrics";
import { CropHealth } from "../components/CropHealth";
import { EquipmentStatus } from "../components/EquipmentStatus";
import { ProductionChart } from "../components/ProductionChart";
import { WaterUsageChart } from "../components/WaterUsageChart";
import { AlertsPanel } from "../components/AlertsPanel";
import { QuickStats } from "../components/QuickStats";

export function Dashboard() {
  return (
    <>
      {/* Quick Stats */}
      <QuickStats />
      
      {/* Environmental Metrics */}
      <section className="mb-6">
        <h2 className="text-xl mb-4">Environmental Conditions</h2>
        <EnvironmentalMetrics />
      </section>
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ProductionChart />
        <WaterUsageChart />
      </div>
      
      {/* Crop Health & Equipment Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <CropHealth />
        </div>
        <div>
          <AlertsPanel />
        </div>
      </div>
      
      {/* Equipment Status */}
      <EquipmentStatus />
    </>
  );
}
