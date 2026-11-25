// A key number of the dashboard: label, value and a short note
function StatCard({ label, value, note, danger = false }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={danger ? 'stat-value stat-value-danger' : 'stat-value'}>{value}</div>
      <div className="stat-note">{note}</div>
    </div>
  )
}

export default StatCard
