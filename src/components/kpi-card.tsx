import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

interface KpiCardProps {
  title: string
  value: string | React.ReactNode
  description?: string
  loading?: boolean
}

export function KpiCard({ title, value, description, loading }: KpiCardProps) {
  return (
    <Card className="border-t-[3px] border-t-[#0ABFBC] shadow-sm bg-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
