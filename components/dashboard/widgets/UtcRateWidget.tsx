'use client';

interface UtcRateWidgetProps {
  rate: number;
  total: number;
}

export function UtcRateWidget({ rate, total }: UtcRateWidgetProps) {
  const utcCount = Math.round((total * rate) / 100);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl font-bold text-orange-600">{rate}%</div>
        <p className="text-sm text-muted-foreground mt-2">Unable to Contact Rate</p>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">UTC Count:</span>
        <span className="font-semibold">{utcCount}</span>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Total Outreach:</span>
        <span className="font-semibold">{total}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-orange-600 h-2 rounded-full transition-all"
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

