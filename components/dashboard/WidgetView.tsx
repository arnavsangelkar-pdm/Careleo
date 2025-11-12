'use client';

import { useMemo } from 'react';
import type { WidgetConfig } from '@/lib/widgets/types';
import type { Member, Outreach } from '@/lib/mock';
import { ReasonsBar } from '@/components/analytics/ReasonsBar';
import { ChannelDistribution } from '@/components/charts/ChannelDistribution';
import { TopBottomChannelWidget } from './widgets/TopBottomChannelWidget';
import { HedisGapClosureWidget } from './widgets/HedisGapClosureWidget';
import { CohortCountsWidget } from './widgets/CohortCountsWidget';
import { RiskDistributionWidget } from './widgets/RiskDistributionWidget';
import { UtcRateWidget } from './widgets/UtcRateWidget';
import { OutreachTrend14dWidget } from './widgets/OutreachTrend14dWidget';
import { countByReason, topNWithOthers } from '@/lib/selectors.analytics';
import { countByChannel, seriesFromCounts, topAndBottomChannel } from '@/lib/selectors.analytics';
import { filterByTeam, filterByDays, summarizeOutreach } from '@/lib/selectors.outreach';
import { subsetOutreach, seriesTouchesOverTime } from '@/lib/analytics';
import { computeCohortSizes } from '@/lib/selectors.cohorts';
import { cohorts } from '@/lib/mock';

interface WidgetViewProps {
  config: WidgetConfig;
  members: Member[];
  outreach: Outreach[];
}

export function WidgetView({ config, members, outreach }: WidgetViewProps) {
  // Filter outreach based on widget config
  const filteredOutreach = useMemo(() => {
    let filtered = [...outreach];

    // Apply timeframe filter
    if (config.timeframe) {
      const days = config.timeframe === '30d' ? 30 : config.timeframe === '90d' ? 90 : 180;
      filtered = filterByDays(filtered, days);
    }

    // Apply team filter
    if (config.teamId) {
      filtered = filterByTeam(filtered, config.teamId);
    }

    return filtered;
  }, [outreach, config.timeframe, config.teamId]);

  switch (config.kind) {
    case 'reasonsBar': {
      const reasonCounts = countByReason(filteredOutreach);
      const series = topNWithOthers(reasonCounts, 8).map(([name, value]) => ({
        name: String(name),
        value: Number(value),
      }));
      return <ReasonsBar data={series} />;
    }

    case 'channelDistribution': {
      const counts = countByChannel(filteredOutreach);
      const series = seriesFromCounts(counts);
      return <ChannelDistribution data={series} />;
    }

    case 'topBottomChannel': {
      const channels = topAndBottomChannel(filteredOutreach);
      return <TopBottomChannelWidget top={channels.top} bottom={channels.bottom} />;
    }

    case 'hedisGapClosure': {
      return <HedisGapClosureWidget members={members} hedisCode={config.hedisCode} />;
    }

    case 'cohortCounts': {
      const cohortSizes = computeCohortSizes(cohorts, members);
      return <CohortCountsWidget cohorts={cohortSizes} />;
    }

    case 'riskDistribution': {
      return <RiskDistributionWidget members={members} />;
    }

    case 'utcRate': {
      const summary = summarizeOutreach(filteredOutreach);
      return <UtcRateWidget rate={summary.utcRate} total={summary.total} />;
    }

    case 'outreachTrend14d': {
      // Get last 14 days of data, grouped by day
      const now = new Date();
      const from = new Date(now);
      from.setDate(from.getDate() - 14);
      const trendData = seriesTouchesOverTime(
        subsetOutreach(outreach, { from, to: now }),
        14
      );
      return <OutreachTrend14dWidget data={trendData} />;
    }

    default:
      return (
        <div className="text-sm text-muted-foreground">Widget not implemented</div>
      );
  }
}

