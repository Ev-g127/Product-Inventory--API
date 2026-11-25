// A small colored label. tone: neutral, success, warning, danger or info
function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export default Badge
