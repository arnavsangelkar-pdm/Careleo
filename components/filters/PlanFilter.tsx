'use client';
import * as React from 'react';
import { PLANS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

type Props = {
  value: string[];                 // selected plans
  onChange: (plans: string[]) => void;
  label?: string;
  multi?: boolean;
};

export default function PlanFilter({ value, onChange, label = 'Plan', multi = true }: Props) {
  const [tempSelection, setTempSelection] = React.useState<string>('');

  const handleAddPlan = (plan: string) => {
    if (!value.includes(plan)) {
      onChange([...value, plan]);
    }
    setTempSelection('');
  };

  const removePlan = (plan: string) => {
    onChange(value.filter(p => p !== plan));
  };

  const clearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={tempSelection} onValueChange={handleAddPlan}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={`Add ${label}`} />
          </SelectTrigger>
          <SelectContent>
            {PLANS.filter(plan => !value.includes(plan)).map(plan => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {value.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAll}
            className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        )}
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map(plan => (
            <Badge 
              key={plan} 
              variant="secondary" 
              className="cursor-pointer flex items-center gap-1 pr-1" 
              onClick={() => removePlan(plan)}
            >
              {plan}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
