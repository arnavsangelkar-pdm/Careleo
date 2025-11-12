'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableTileProps {
  id: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function SortableTile({
  id,
  disabled,
  className,
  children,
}: SortableTileProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`${className} ${isDragging ? 'opacity-50 z-50' : ''} ${
        !disabled ? 'cursor-grab active:cursor-grabbing' : ''
      }`}
      {...(disabled ? {} : { ...attributes, ...listeners })}
      aria-grabbed={!disabled && !isDragging ? false : !disabled}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
    >
      {children}
    </div>
  );
}

