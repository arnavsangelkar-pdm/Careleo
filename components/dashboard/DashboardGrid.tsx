'use client';

import { useMemo } from 'react';
import type { DashboardLayout, WidgetConfig } from '@/lib/widgets/types';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableTile } from './SortableTile';
import { WidgetTile } from './WidgetTile';
import type { Member, Outreach } from '@/lib/mock';

interface DashboardGridProps {
  edit: boolean;
  layout: DashboardLayout;
  onChange: (layout: DashboardLayout) => void;
  members: Member[];
  outreach: Outreach[];
}

export function DashboardGrid({
  edit,
  layout,
  onChange,
  members,
  outreach,
}: DashboardGridProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const ids = useMemo(() => layout.items.map((i) => i.id), [layout.items]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return;
        const oldIndex = layout.items.findIndex((i) => i.id === String(active.id));
        const newIndex = layout.items.findIndex((i) => i.id === String(over.id));
        if (oldIndex !== -1 && newIndex !== -1) {
          const items = arrayMove(layout.items, oldIndex, newIndex);
          onChange({ ...layout, items });
        }
      }}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-12 gap-4">
          {layout.items.map((cfg) => {
            const colSpan = cfg.w ?? 6;
            const colSpanClasses: Record<number, string> = {
              1: 'col-span-1',
              2: 'col-span-2',
              3: 'col-span-3',
              4: 'col-span-4',
              5: 'col-span-5',
              6: 'col-span-6',
              7: 'col-span-7',
              8: 'col-span-8',
              9: 'col-span-9',
              10: 'col-span-10',
              11: 'col-span-11',
              12: 'col-span-12',
            };
            return (
              <SortableTile
                key={cfg.id}
                id={cfg.id}
                disabled={!edit}
                className={colSpanClasses[colSpan] || 'col-span-6'}
              >
                <WidgetTile
                  edit={edit}
                  config={cfg}
                  onChange={(next) => {
                    const items = layout.items.map((i) =>
                      i.id === cfg.id ? next : i
                    );
                    onChange({ ...layout, items });
                  }}
                  onRemove={() => {
                    const items = layout.items.filter((i) => i.id !== cfg.id);
                    onChange({ ...layout, items });
                  }}
                  members={members}
                  outreach={outreach}
                />
              </SortableTile>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
}

