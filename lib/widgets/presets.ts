import type { DashboardLayout } from './types';
import { WIDGET_DEFAULT_SIZE as S } from './registry';

const id = () => Math.random().toString(36).slice(2);

export const PRESET_QUALITY: DashboardLayout = {
  persona: 'quality',
  items: [
    { id: id(), kind: 'hedisGapClosure', ...S.hedisGapClosure },
    { id: id(), kind: 'reasonsBar', ...S.reasonsBar },
    { id: id(), kind: 'topBottomChannel', ...S.topBottomChannel },
    { id: id(), kind: 'channelDistribution', ...S.channelDistribution },
    { id: id(), kind: 'utcRate', ...S.utcRate },
  ],
};

export const PRESET_RISK: DashboardLayout = {
  persona: 'risk',
  items: [
    { id: id(), kind: 'riskDistribution', ...S.riskDistribution },
    { id: id(), kind: 'outreachTrend14d', ...S.outreachTrend14d },
    { id: id(), kind: 'reasonsBar', ...S.reasonsBar },
  ],
};

export const PRESET_MEMBER_SERVICES: DashboardLayout = {
  persona: 'memberServices',
  items: [
    { id: id(), kind: 'channelDistribution', ...S.channelDistribution },
    { id: id(), kind: 'topBottomChannel', ...S.topBottomChannel },
    { id: id(), kind: 'utcRate', ...S.utcRate },
  ],
};

export const PRESETS = {
  quality: PRESET_QUALITY,
  risk: PRESET_RISK,
  memberServices: PRESET_MEMBER_SERVICES,
};

