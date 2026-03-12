import { useVenueForecastData } from '@/hooks/use-venue-forecast-data';

interface ManagementSummaryProps {
  venueId: string;
  weekStart: Date;
}

export function ManagementSummary({ venueId, weekStart }: ManagementSummaryProps) {
  const weekStr = weekStart.toISOString().split('T')[0];
  console.log('[ManagementSummary] rendering financial table for venueId:', venueId, 'weekStart:', weekStr);
  
  const { data: forecastData, isLoading } = useVenueForecastData(venueId, weekStart);

  console.log('[ManagementSummary] isLoading:', isLoading, 'forecastData exists:', !!forecastData);

  if (isLoading) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
        <div className="animate-pulse h-20 bg-zinc-100"></div>
      </div>
    );
  }

  // Show stable empty state after loading completes
  if (!forecastData) {
    return (
      <div className="bg-white border border-zinc-200 rounded-lg p-4">
        <p className="text-xs text-zinc-500">No financial data available</p>
      </div>
    );
  }

  const budgetPercent =
    forecastData.labourBudget > 0
      ? (forecastData.scheduledLabourCost / forecastData.labourBudget) * 100
      : 0;

  const summaryRows = [
    { label: 'Forecast Revenue', value: `$${forecastData.forecastSales.toLocaleString()}` },
    { label: 'Budget Revenue', value: '—' },
    { label: 'Budget Wage %', value: `${forecastData.labourTargetPercent}%` },
    { label: 'Wage Cost Forecast', value: `$${forecastData.scheduledLabourCost.toFixed(0)}` },
    { label: 'Wage Cost Actual', value: '—' },
    { label: 'Forecast Hours', value: `${forecastData.scheduledHours.toFixed(1)} hrs` },
    { label: 'Actual Hours', value: '—' },
  ];

  return (
    <div className="bg-white border border-zinc-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody>
            {summaryRows.map((row, idx) => (
              <tr key={idx} className="border-b border-zinc-100 last:border-b-0">
                <td className="px-4 py-2 font-medium text-zinc-900 w-40">
                  {row.label}
                </td>
                <td className="px-4 py-2 text-zinc-600">
                  {row.value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
