import type { WidgetKind } from './types';

export const WIDGET_DEFAULT_TITLES: Record<WidgetKind, string> = {
  topBottomChannel: 'Top & Bottom Channel',
  reasonsBar: 'Touches by Reason',
  channelDistribution: 'Channel Distribution',
  hedisGapClosure: 'HEDIS Gap Closure',
  cohortCounts: 'Cohort Counts',
  riskDistribution: 'Abrasion Risk Distribution',
  utcRate: 'Unable to Contact (UTC) Rate',
  outreachTrend14d: 'Outreach – 14‑day Trend',
};

export const WIDGET_DEFAULT_SIZE: Record<WidgetKind, { w: number; h: number }> = {
  topBottomChannel: { w: 6, h: 3 },
  reasonsBar: { w: 6, h: 4 },
  channelDistribution: { w: 6, h: 4 },
  hedisGapClosure: { w: 6, h: 3 },
  cohortCounts: { w: 4, h: 3 },
  riskDistribution: { w: 4, h: 3 },
  utcRate: { w: 4, h: 2 },
  outreachTrend14d: { w: 12, h: 3 },
};

