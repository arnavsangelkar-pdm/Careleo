import React from 'react'

interface LoadingShimmerProps {
  className?: string
}

export function LoadingShimmer({ className = '' }: LoadingShimmerProps) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-gray-200 rounded h-4 w-3/4 mb-2"></div>
      <div className="bg-gray-200 rounded h-3 w-1/2"></div>
    </div>
  )
}

export function CardShimmer() {
  return (
    <div className="animate-pulse">
      <div className="bg-white rounded-2xl border p-6">
        <div className="bg-gray-200 rounded h-6 w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="bg-gray-200 rounded h-4 w-full"></div>
          <div className="bg-gray-200 rounded h-4 w-5/6"></div>
          <div className="bg-gray-200 rounded h-4 w-4/6"></div>
        </div>
      </div>
    </div>
  )
}

export function TableShimmer() {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg border p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-200 rounded-full h-10 w-10"></div>
              <div className="flex-1">
                <div className="bg-gray-200 rounded h-4 w-1/4 mb-2"></div>
                <div className="bg-gray-200 rounded h-3 w-1/2"></div>
              </div>
              <div className="bg-gray-200 rounded h-6 w-16"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
