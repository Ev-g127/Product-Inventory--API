import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getJson } from '../api.js'
import Alert from '../components/Alert.jsx'
import Badge from '../components/Badge.jsx'
import BarList from '../components/BarList.jsx'
import PageHeader from '../components/PageHeader.jsx'
import StatCard from '../components/StatCard.jsx'
import { formatMoney, plural, stockStatus } from '../utils.js'

// Loads the 3 lists the dashboard needs, at the same time
async function fetchDashboard() {
  const [stats, suppliers, lowStock] = await Promise.all([
    getJson('/stats'),
    getJson('/suppliers'),
    getJson('/products?lowStock=true&sort=quantity'),
  ])
  return { stats, suppliers, lowStock }
}

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  // Shows the data once they arrive, or the error message of the API
  function show(request) {
    return request
      .then((result) => {
        setData(result)
        setError('')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  // Load the data once, when the page opens
  useEffect(() => {
    show(fetchDashboard())
  }, [])

  function refresh() {
    setLoading(true)
    show(fetchDashboard())
  }

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of the inventory">
        <button type="button" className="btn btn-secondary" onClick={refresh} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </PageHeader>

      {error && <Alert>{error}</Alert>}

      {data && <DashboardContent {...data} />}
    </>
  )
}

function DashboardContent({ stats, suppliers, lowStock }) {
  return (
    <>
      <section className="stats">
        <StatCard
          label="Products"
          value={stats.totalProducts}
          note={`${plural(stats.byCategory.length, 'category', 'categories')} · ${plural(suppliers.length, 'supplier')}`}
        />
        <StatCard label="Units in stock" value={stats.totalUnits} note={`In ${plural(stats.byWarehouse.length, 'warehouse')}`} />
        <StatCard label="Stock value" value={formatMoney(stats.stockValue)} note="Price × quantity, all products" />
        <StatCard label="Low stock" value={stats.lowStock.length} note="Products to order again" danger={stats.lowStock.length > 0} />
      </section>

      <div className="dashboard-row">
        <section className="card">
          <h2 className="section-title">Units by warehouse</h2>
          <BarList
            items={stats.byWarehouse.map((w) => ({
              label: w.warehouse,
              value: w.units,
              note: `${plural(w.units, 'unit')} · ${plural(w.products, 'product')}`,
            }))}
          />
        </section>

        <section className="card">
          <div className="card-title">
            <h2 className="section-title">Low stock</h2>
            <Link to="/products" className="link">View all products</Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="text-secondary">No product has a low stock.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product</th>
                    <th className="num">Quantity</th>
                    <th className="num">Threshold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product) => {
                    const status = stockStatus(product)
                    return (
                      <tr key={product.id}>
                        <td>{product.sku}</td>
                        <td className="strong">{product.name}</td>
                        <td className="num">{product.quantity}</td>
                        <td className="num">{product.lowStockThreshold}</td>
                        <td><Badge tone={status.tone}>{status.label}</Badge></td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="card">
        <h2 className="section-title">Units by category</h2>
        <BarList
          items={stats.byCategory.map((c) => ({
            label: c.category,
            value: c.units,
            note: `${plural(c.units, 'unit')} · ${plural(c.products, 'product')}`,
          }))}
        />
      </section>
    </>
  )
}

export default Dashboard
