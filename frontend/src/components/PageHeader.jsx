// The title of a page, its subtitle, and its buttons on the right
function PageHeader({ title, subtitle, children }) {
  return (
    <header className="page-header">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      <div className="page-actions">{children}</div>
    </header>
  )
}

export default PageHeader
