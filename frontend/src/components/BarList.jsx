// A list of horizontal bars. items: [{ label, value, note }]. The longest bar is the largest value.
function BarList({ items }) {
  const max = Math.max(1, ...items.map((item) => item.value))

  return (
    <div className="bar-list">
      {items.map((item) => (
        <div className="bar-item" key={item.label}>
          <div className="bar-labels">
            <span className="bar-label">{item.label}</span>
            <span className="caption text-secondary">{item.note}</span>
          </div>
          <div className="bar-track">
            {item.value > 0 && <div className="bar-fill" style={{ width: `${(item.value / max) * 100}%` }} />}
          </div>
        </div>
      ))}
    </div>
  )
}

export default BarList
