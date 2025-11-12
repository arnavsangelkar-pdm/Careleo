'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WIDGET_DEFAULT_TITLES } from '@/lib/widgets/registry';
import type { WidgetConfig } from '@/lib/widgets/types';
import { WidgetView } from './WidgetView';
import { GripVertical, X, Settings } from 'lucide-react';
import type { Member, Outreach } from '@/lib/mock';

interface WidgetTileProps {
  edit: boolean;
  config: WidgetConfig;
  onChange: (c: WidgetConfig) => void;
  onRemove: () => void;
  members: Member[];
  outreach: Outreach[];
}

export function WidgetTile({
  edit,
  config,
  onChange,
  onRemove,
  members,
  outreach,
}: WidgetTileProps) {
  const title = config.title ?? WIDGET_DEFAULT_TITLES[config.kind];

  const handleResize = () => {
    // Cycle widths: 3 → 4 → 6 → 12
    const currentW = config.w ?? 6;
    const nextW =
      currentW === 3 ? 4 : currentW === 4 ? 6 : currentW === 6 ? 12 : 3;
    onChange({ ...config, w: nextW });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {edit && (
            <GripVertical
              className="h-4 w-4 text-muted-foreground flex-shrink-0"
              aria-label="Drag handle"
            />
          )}
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base">{title}</CardTitle>
            {config.timeframe && (
              <CardDescription className="text-xs">
                {config.timeframe}
              </CardDescription>
            )}
          </div>
        </div>
        {edit && (
          <div className="flex gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResize}
              title="Resize widget"
              aria-label="Resize widget"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={onRemove}
              title="Remove widget"
              aria-label="Remove widget"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <WidgetView config={config} members={members} outreach={outreach} />
      </CardContent>
    </Card>
  );
}

