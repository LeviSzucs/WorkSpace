import { TrendingUp, DollarSign, Clock } from 'lucide-react';
import { useVenueForecastData } from '@/hooks/use-venue-forecast-data';

interface ManagementSummaryProps {
  venueId: string;
  weekStart: Date;
}

export function ManagementSummary({ venueId, weekStart }: ManagementSummaryProps) {
  const weekStr = weekStart.toISOString().split('T')[0];
  console.log('[ManagementSummary] rendering for venueId:', venueId, 'weekStart:', weekStr);
  
  const { data: forecastData, isLoading } = useVenueForecastData(venueId, weekStart);

  console.log('[ManagementSummary] isLoading:', isLoading, 'forecastData exists:', !!forecastData);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-200 p-6 animate-pulse">
            <div className="h-4 bg-zinc-200 rounded w-20 mb-4"></div>
            <div className="h-8 bg-zinc-200 rounded w-24 mb-2"></div>
            <div className="h-3 bg-zinc-100 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  // Show stable empty state after loading completes
  if (!forecastData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-zinc-200 p-6">
            <p className="text-xs text-zinc-500">No data available</p>
          </div>
        ))}
      </div>
    );
  }

  const budgetPercent =
    forecastData.labourBudget > 0
      ? (forecastData.scheduledLabourCost / forecastData.labourBudget) * 100
      : 0;
  const isOverBudget = budgetPercent > 100;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Revenue Forecast */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase">Forecast Sales</h3>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-xl font-display font-bold text-zinc-900">
          ${forecastData.forecastSales.toLocaleString()}
        </div>
        <div className="text-xs text-zinc-500">
          Target: {forecastData.labourTargetPercent}% labour of revenue
        </div>
      </div>

      {/* Labor Cost Budget */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase">Labour Cost</h3>
          <DollarSign className="w-4 h-4 text-blue-600" />
        </div>
        <div className="text-xl font-display font-bold text-zinc-900">
          ${forecastData.scheduledLabourCost.toFixed(0)} / ${forecastData.labourBudget.toFixed(0)}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600">
              {isOverBudget ? 'Over budget' : 'Remaining'}
            </span>
            <span
              className={`text-xs font-semibold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}
            >
              ${Math.abs(forecastData.variance).toFixed(0)}
            </span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isOverBudget ? 'bg-red-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(budgetPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scheduled Hours */}
      <div className="bg-white rounded-xl border border-zinc-200 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-zinc-900 uppercase">Scheduled Hours</h3>
          <Clock className="w-4 h-4 text-violet-600" />
        </div>
        <div className="text-xl font-display font-bold text-zinc-900">
          {forecastData.scheduledHours.toFixed(1)} hrs
        </div>
        <div className="text-xs text-zinc-500">
          {budgetPercent.toFixed(0)}% of labour budget
        </div>
      </div>
    </div>
  );
}
