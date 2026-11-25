// A message in a colored box, for example the error sent back by the API. tone: danger or success
function Alert({ tone = 'danger', children }) {
  return (
    <div className={`alert alert-${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      {children}
    </div>
  )
}

export default Alert
