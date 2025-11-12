'use client';

import type { Cohort } from '@/lib/types';
import { Badge } from '@/components/ui/badge';

interface CohortCountsWidgetProps {
  cohorts: Cohort[];
}

export function CohortCountsWidget({ cohorts }: CohortCountsWidgetProps) {
  const grouped = cohorts.reduce<Record<string, Cohort[]>>((acc, cohort) => {
    if (!acc[cohort.category]) {
      acc[cohort.category] = [];
    }
    acc[cohort.category].push(cohort);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([category, categoryCohorts]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold mb-2 capitalize">{category}</h4>
          <div className="space-y-2">
            {categoryCohorts.map((cohort) => (
              <div
                key={cohort.id}
                className="flex items-center justify-between p-2 bg-muted rounded"
              >
                <span className="text-sm">{cohort.name}</span>
                <Badge variant="secondary">{cohort.size || 0}</Badge>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

