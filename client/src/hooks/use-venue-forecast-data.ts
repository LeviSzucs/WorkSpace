import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface ForecastData {
  forecastSales: number;
  labourBudget: number;
  labourTargetPercent: number;
  scheduledHours: number;
  scheduledLabourCost: number;
  variance: number;
  variancePercent: number;
}

export function useVenueForecastData(
  venueId: string | null,
  weekStartDate: Date
): {
  data: ForecastData | null;
  isLoading: boolean;
  error: Error | null;
} {
  const [data, setData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!venueId) {
        setData(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const weekEndDate = new Date(weekStartDate);
        weekEndDate.setDate(weekEndDate.getDate() + 6);
        const startDateStr = weekStartDate.toISOString().split('T')[0];
        const endDateStr = weekEndDate.toISOString().split('T')[0];

        // Fetch venue forecast for this week
        const { data: forecastData, error: forecastError } = await supabase
          .from('venue_forecasts')
          .select('forecast_sales')
          .eq('venue_id', venueId)
          .eq('forecast_date', startDateStr)
          .single();

        if (forecastError && forecastError.code !== 'PGRST116') throw forecastError;

        const forecastSales = forecastData?.forecast_sales || 0;

        // Fetch venue budget for this week
        const { data: budgetData, error: budgetError } = await supabase
          .from('venue_budgets')
          .select('labour_budget, labour_target_percent')
          .eq('venue_id', venueId)
          .eq('budget_week_start', startDateStr)
          .single();

        if (budgetError && budgetError.code !== 'PGRST116') throw budgetError;

        const labourBudget = budgetData?.labour_budget || 0;
        const labourTargetPercent = budgetData?.labour_target_percent || 0;

        // Fetch shifts and calculate hours + labour cost
        const { data: shiftsData, error: shiftsError } = await supabase
          .from('shifts')
          .select(
            `
            id,
            start_time,
            end_time,
            shift_assignments (
              user_id,
              users (hourly_rate)
            )
          `
          )
          .eq('venue_id', venueId)
          .gte('shift_date', startDateStr)
          .lte('shift_date', endDateStr);

        if (shiftsError) throw shiftsError;

        let scheduledHours = 0;
        let scheduledLabourCost = 0;

        (shiftsData || []).forEach((shift: any) => {
          const startTime = shift.start_time.split(':');
          const endTime = shift.end_time.split(':');
          const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
          const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
          const hours = (endMinutes - startMinutes) / 60;

          if (hours > 0) {
            scheduledHours += hours;

            // Add labour cost from assigned staff
            (shift.shift_assignments || []).forEach((assignment: any) => {
              const hourlyRate = assignment.users?.hourly_rate || 0;
              scheduledLabourCost += hours * hourlyRate;
            });
          }
        });

        // Calculate variance
        const variance = labourBudget - scheduledLabourCost;
        const variancePercent = labourBudget > 0 ? (variance / labourBudget) * 100 : 0;

        setData({
          forecastSales,
          labourBudget,
          labourTargetPercent,
          scheduledHours,
          scheduledLabourCost,
          variance,
          variancePercent,
        });
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch forecast data');
        setError(error);
        console.error('Error fetching forecast data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [venueId, weekStartDate]);

  return {
    data,
    isLoading,
    error,
  };
}
