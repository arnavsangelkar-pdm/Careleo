'use client';

import { useEffect, useState } from 'react';
import { PRESETS } from '@/lib/widgets/presets';
import { loadLayout, saveLayout, clearLayout } from '@/lib/widgets/storage';
import type { DashboardLayout } from '@/lib/widgets/types';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardGrid } from '@/components/dashboard/DashboardGrid';
import { AddWidget } from '@/components/dashboard/AddWidget';
import { SectionTitle } from '@/components/SectionTitle';
import { generateMockMembers, generateMockOutreach, attachCohortsAndTypes, addSdohProfiles } from '@/lib/mock';
import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const PERSONAS = [
  { key: 'quality', label: 'Quality' },
  { key: 'risk', label: 'Risk Adjustment' },
  { key: 'memberServices', label: 'Member Services' },
] as const;

type PersonaKey = typeof PERSONAS[number]['key'];

export default function DashboardPage() {
  const [persona, setPersona] = useState<PersonaKey>('quality');
  const [layout, setLayout] = useState<DashboardLayout>(PRESETS[persona]);
  const [edit, setEdit] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Generate mock data (same as main app)
  const { members, outreach } = useMemo(() => {
    const mockMembers = generateMockMembers(10045);
    const mockOutreach = generateMockOutreach(mockMembers, 30135);
    const membersWithSdoh = addSdohProfiles(mockMembers, mockOutreach);
    const membersWithCohorts = attachCohortsAndTypes(membersWithSdoh, { recentWindowDays: 30 });
    return { members: membersWithCohorts, outreach: mockOutreach };
  }, []);

  // Load persisted or preset on persona change
  useEffect(() => {
    const persisted = loadLayout(persona);
    setLayout(persisted ?? PRESETS[persona]);
    setHasUnsavedChanges(false);
  }, [persona]);

  const handleSave = () => {
    saveLayout(layout);
    setEdit(false);
    setHasUnsavedChanges(false);
  };

  const handleReset = () => {
    clearLayout(persona);
    setLayout(PRESETS[persona]);
    setHasUnsavedChanges(false);
  };

  const handleLayoutChange = (newLayout: DashboardLayout) => {
    setLayout(newLayout);
    setHasUnsavedChanges(true);
  };

  const handleAddWidget = (config: typeof layout.items[0]) => {
    handleLayoutChange({
      ...layout,
      items: [...layout.items, config],
    });
  };

  const handleExitEdit = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to exit?')) {
        setEdit(false);
        // Reload from storage or preset
        const persisted = loadLayout(persona);
        setLayout(persisted ?? PRESETS[persona]);
        setHasUnsavedChanges(false);
      }
    } else {
      setEdit(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to CRM</span>
          </Button>
        </Link>
      </div>
      <SectionTitle
        title="Analytics Dashboard"
        subtitle="Personalize your analytics view with drag-and-drop widgets"
      />

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label htmlFor="persona-select" className="text-sm font-medium">
            Persona:
          </label>
          <Select
            value={persona}
            onValueChange={(value) => setPersona(value as PersonaKey)}
            disabled={edit}
          >
            <SelectTrigger id="persona-select" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERSONAS.map((p) => (
                <SelectItem key={p.key} value={p.key}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant={edit ? 'default' : 'outline'}
          onClick={edit ? handleExitEdit : () => setEdit(true)}
          aria-label={edit ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        >
          {edit ? 'Exit Edit Mode' : 'Edit Layout'}
        </Button>

        {edit && (
          <>
            <Button onClick={handleSave} disabled={!hasUnsavedChanges}>
              Save
            </Button>
            <Button variant="secondary" onClick={handleReset}>
              Reset to Preset
            </Button>
            {hasUnsavedChanges && (
              <span className="text-sm text-muted-foreground">
                Unsaved changes
              </span>
            )}
          </>
        )}
      </div>

      {edit && (
        <div className="border rounded-lg p-4 bg-muted/50">
          <h3 className="text-sm font-semibold mb-2">Add Widget</h3>
          <AddWidget onAdd={handleAddWidget} />
        </div>
      )}

      <DashboardGrid
        edit={edit}
        layout={layout}
        onChange={handleLayoutChange}
        members={members}
        outreach={outreach}
      />
    </div>
  );
}

