import { Link } from 'react-router-dom'
import PageHeader from '../components/PageHeader.jsx'

function NotFound() {
  return (
    <>
      <PageHeader title="Page not found" subtitle="This address does not match any page." />
      <section className="card">
        <Link to="/" className="link">Go back to the dashboard</Link>
      </section>
    </>
  )
}

export default NotFound
