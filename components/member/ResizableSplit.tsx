'use client'

import React, { useEffect, useState } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { GripVertical } from 'lucide-react'

interface ResizableSplitProps {
  children: [React.ReactNode, React.ReactNode]
  defaultSizes?: [number, number]
  minSizes?: [number, number]
  storageKey?: string
  className?: string
}

export function ResizableSplit({
  children,
  defaultSizes = [30, 70],
  minSizes = [20, 30],
  storageKey = 'careleo.members.split',
  className = ''
}: ResizableSplitProps) {
  const [sizes, setSizes] = useState<[number, number]>(defaultSizes)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load saved sizes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const parsedSizes = JSON.parse(saved)
        if (Array.isArray(parsedSizes) && parsedSizes.length === 2) {
          setSizes(parsedSizes as [number, number])
        }
      }
    } catch (error) {
      console.warn('Failed to load saved panel sizes:', error)
    }
    setIsLoaded(true)
  }, [storageKey])

  // Save sizes to localStorage
  const handleSizesChange = (newSizes: number[]) => {
    if (newSizes.length === 2) {
      setSizes([newSizes[0], newSizes[1]])
      try {
        localStorage.setItem(storageKey, JSON.stringify(newSizes))
      } catch (error) {
        console.warn('Failed to save panel sizes:', error)
      }
    }
  }

  // Don't render until sizes are loaded to prevent layout shift
  if (!isLoaded) {
    return (
      <div className={`grid grid-cols-10 gap-6 ${className}`}>
        <div className="col-span-3">
          {children[0]}
        </div>
        <div className="col-span-7">
          {children[1]}
        </div>
      </div>
    )
  }

  return (
    <PanelGroup
      direction="horizontal"
      className={`h-full ${className}`}
      onLayout={handleSizesChange}
    >
      <Panel
        defaultSize={sizes[0]}
        minSize={minSizes[0]}
        className="min-w-0 h-full"
      >
        {children[0]}
      </Panel>
      
      <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors relative group">
        <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-400 group-hover:bg-gray-500 transition-colors" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
      </PanelResizeHandle>
      
      <Panel
        defaultSize={sizes[1]}
        minSize={minSizes[1]}
        className="min-w-0 h-full"
      >
        {children[1]}
      </Panel>
    </PanelGroup>
  )
}
