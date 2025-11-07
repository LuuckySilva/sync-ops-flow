import { StatsCards } from "./StatsCards";
import { RecentActivity } from "./RecentActivity";
import { QuickActions } from "./QuickActions";
import { MonthlyChart } from "./MonthlyChart";

export const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral do sistema WorkFlow Pro
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyChart />
        </div>
        <div>
          <QuickActions />
        </div>
      </div>

      <RecentActivity />
    </div>
  );
};
