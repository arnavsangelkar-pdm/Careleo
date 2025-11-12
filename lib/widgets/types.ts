export type WidgetKind =
  | 'topBottomChannel'
  | 'reasonsBar'
  | 'channelDistribution'
  | 'hedisGapClosure'
  | 'cohortCounts'
  | 'riskDistribution'
  | 'utcRate'
  | 'outreachTrend14d';

export interface WidgetConfig {
  id: string;             // unique instance id
  kind: WidgetKind;       // which widget to render
  title?: string;         // override default
  w?: number;             // width units (1..12)
  h?: number;             // height units (rows)
  // optional view-specific filters
  teamId?: string;
  timeframe?: '30d' | '90d' | '180d';
  hedisCode?: string;
}

export interface DashboardLayout {
  persona: string;        // e.g., 'quality', 'risk', 'memberServices'
  items: WidgetConfig[];  // ordered left->right, top->bottom
}

