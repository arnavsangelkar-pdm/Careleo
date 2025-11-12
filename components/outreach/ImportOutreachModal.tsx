'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Upload, FileSpreadsheet, CheckCircle2, ArrowRight } from 'lucide-react'

interface ImportOutreachModalProps {
  open: boolean
  onClose: () => void
}

type Step = 'upload' | 'map' | 'preview' | 'done'

export default function ImportOutreachModal({ open, onClose }: ImportOutreachModalProps) {
  const [step, setStep] = useState<Step>('upload')
  const { toast } = useToast()

  const handleNext = () => {
    if (step === 'preview') {
      toast({
        title: 'Import successful',
        description: '✅ 253 outreach records imported successfully (simulated)',
        duration: 3000,
      })
      setStep('done')
      setTimeout(onClose, 1200)
    } else {
      const order: Step[] = ['upload', 'map', 'preview', 'done']
      const currentIndex = order.indexOf(step)
      const next = order[currentIndex + 1]
      if (next) {
        setStep(next)
      }
    }
  }

  const handleBack = () => {
    const order: Step[] = ['upload', 'map', 'preview', 'done']
    const currentIndex = order.indexOf(step)
    const prev = order[currentIndex - 1]
    if (prev) {
      setStep(prev)
    }
  }

  const mockPreviewData = [
    { memberId: 'M001', team: 'Quality', channel: 'Call', status: 'Completed', date: '2024-01-15' },
    { memberId: 'M002', team: 'Care Management', channel: 'SMS', status: 'In-Progress', date: '2024-01-16' },
    { memberId: 'M003', team: 'Member Services', channel: 'Email', status: 'Planned', date: '2024-01-17' },
    { memberId: 'M004', team: 'Quality', channel: 'Portal', status: 'Completed', date: '2024-01-18' },
    { memberId: 'M005', team: 'Care Management', channel: 'Call', status: 'Completed', date: '2024-01-19' },
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Outreach Data</DialogTitle>
          <DialogDescription>
            This is a demo-only simulation — no real data is uploaded.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {/* Step 1: Upload */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload an Excel or CSV file (simulation)
                </p>
                <p className="text-xs text-gray-500">
                  Supported formats: .xlsx, .xls, .csv
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Demo Mode:</strong> No file will actually be uploaded. Click Next to continue with the simulation.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Map Columns */}
          {step === 'map' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Map your columns to the required fields:
              </p>
              <div className="border rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-700">Source Column</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">Member ID</div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Target Field</label>
                    <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">memberId</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-700">Source Column</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">Team</div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Target Field</label>
                    <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">teamId</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium text-gray-700">Source Column</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">Channel</div>
                  </div>
                  <div>
                    <label className="font-medium text-gray-700">Target Field</label>
                    <div className="mt-1 p-2 bg-blue-50 rounded border border-blue-200">channel</div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  Column mapping is simulated. All data shown is synthetic.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Preview */}
          {step === 'preview' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Preview 5 mock records below — all data synthetic:
              </p>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Member ID</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Team</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Channel</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Status</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockPreviewData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-3 py-2">{row.memberId}</td>
                        <td className="px-3 py-2">{row.team}</td>
                        <td className="px-3 py-2">{row.channel}</td>
                        <td className="px-3 py-2">{row.status}</td>
                        <td className="px-3 py-2">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Total records to import:</strong> 253 (simulated)
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Done */}
          {step === 'done' && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Import complete!</h3>
                <p className="text-sm text-gray-600 mt-2">Closing...</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {step !== 'done' && (
            <>
              {step !== 'upload' && (
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
              )}
              <Button onClick={handleNext} className="flex items-center gap-2">
                {step === 'preview' ? (
                  <>
                    <FileSpreadsheet className="h-4 w-4" />
                    Import
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

