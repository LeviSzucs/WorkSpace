import { TrendingUp, DollarSign, AlertCircle } from 'lucide-react';

interface ManagementSummaryProps {
  venueId: string;
  weekStart: Date;
}

export function ManagementSummary({ venueId, weekStart }: ManagementSummaryProps) {
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Revenue Forecast */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Revenue Forecast</h3>
          <TrendingUp className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <div className="text-2xl font-display font-bold text-zinc-900">$8,450</div>
          <p className="text-xs text-zinc-500 mt-1">This week • +12% vs last week</p>
        </div>
        <div className="pt-3 border-t border-zinc-100">
          <p className="text-xs text-zinc-600">Based on current staffing & historical patterns</p>
        </div>
      </div>

      {/* Labor Cost Budget */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Labor Cost</h3>
          <DollarSign className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="text-2xl font-display font-bold text-zinc-900">$3,280</div>
          <p className="text-xs text-zinc-500 mt-1">This week • Budget: $3,600</p>
        </div>
        <div className="pt-3 border-t border-zinc-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600">Budget utilization</span>
            <span className="text-xs font-semibold text-zinc-900">91%</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91%' }} />
          </div>
        </div>
      </div>

      {/* Staffing Status */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-900">Staffing</h3>
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <div className="text-2xl font-display font-bold text-zinc-900">14/16</div>
          <p className="text-xs text-zinc-500 mt-1">Staff scheduled • 2 gaps</p>
        </div>
        <div className="pt-3 border-t border-zinc-100">
          <p className="text-xs text-zinc-600">Review critical shifts in the grid below</p>
        </div>
      </div>
    </div>
  );
}
