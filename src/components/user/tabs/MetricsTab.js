import ChartView from '@/components/ChartView'

export default function MetricsTab({ stats }) {
  if (!stats) return <div className="text-center py-10">Cargando métricas...</div>

  return (
    <div className="space-y-6">
      <ChartView stats={stats} />
    </div>
  )
}
