import PageHeader from '../components/PageHeader.jsx'

// A temporary page, until the real one is coded
function ComingSoon({ title }) {
  return (
    <>
      <PageHeader title={title} />
      <section className="card">
        <p className="text-secondary">This page is coming next. Its design is ready in the Figma mock-up.</p>
      </section>
    </>
  )
}

export default ComingSoon
