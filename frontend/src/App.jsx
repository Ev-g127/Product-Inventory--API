import { Route, Routes } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import ComingSoon from './pages/ComingSoon.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NotFound from './pages/NotFound.jsx'

// The layout of every page: the sidebar on the left, the page on the right
function App() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/products" element={<ComingSoon title="Products" />} />
          <Route path="/products/:sku" element={<ComingSoon title="Product details" />} />
          <Route path="/warehouses" element={<ComingSoon title="Warehouses" />} />
          <Route path="/categories-suppliers" element={<ComingSoon title="Categories & suppliers" />} />
          <Route path="/users" element={<ComingSoon title="Users" />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
