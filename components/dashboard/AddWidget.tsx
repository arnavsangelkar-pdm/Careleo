'use client';

import { WIDGET_DEFAULT_TITLES, WIDGET_DEFAULT_SIZE } from '@/lib/widgets/registry';
import type { WidgetKind, WidgetConfig } from '@/lib/widgets/types';
import { Button } from '@/components/ui/button';

const KINDS = Object.keys(WIDGET_DEFAULT_TITLES) as WidgetKind[];

interface AddWidgetProps {
  onAdd: (c: WidgetConfig) => void;
}

export function AddWidget({ onAdd }: AddWidgetProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {KINDS.map((k) => (
        <Button
          key={k}
          variant="outline"
          size="sm"
          onClick={() =>
            onAdd({
              id: crypto.randomUUID(),
              kind: k,
              ...WIDGET_DEFAULT_SIZE[k],
            })
          }
        >
          + {WIDGET_DEFAULT_TITLES[k]}
        </Button>
      ))}
    </div>
  );
}

