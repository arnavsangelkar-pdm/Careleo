import { toast } from '@/hooks/use-toast'

/**
 * Mock export function that simulates CSV export without actually generating files.
 * Shows toast notifications to indicate the export process.
 */
export function mockExport(label: string, rowCount: number) {
  const delay = 700 + Math.random() * 400

  toast({
    title: 'Generating export...',
    description: `Preparing ${label} export with ${rowCount} records`,
    duration: 800,
  })

  setTimeout(() => {
    toast({
      title: 'Export complete',
      description: `✅ ${rowCount} records exported (simulated)`,
      duration: 3000,
    })
  }, delay)
}

