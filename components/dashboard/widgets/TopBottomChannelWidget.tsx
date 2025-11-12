'use client';

interface TopBottomChannelWidgetProps {
  top: string;
  bottom: string;
}

export function TopBottomChannelWidget({ top, bottom }: TopBottomChannelWidgetProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div>
          <p className="text-sm text-muted-foreground">Top Channel</p>
          <p className="text-2xl font-semibold text-blue-700">{top}</p>
        </div>
      </div>
      <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div>
          <p className="text-sm text-muted-foreground">Bottom Channel</p>
          <p className="text-2xl font-semibold text-orange-700">{bottom}</p>
        </div>
      </div>
    </div>
  );
}

