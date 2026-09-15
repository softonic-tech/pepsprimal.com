import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CoaAction } from './CoaDialog'
import { useProducts } from '../context/ProductsContext'

export default function CoaLibrary() {
  const { products, loading, error } = useProducts()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all') // all | available | pending

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (products || [])
      .filter((p) => {
        if (filter === 'available' && !p.coaUrl) return false
        if (filter === 'pending' && p.coaUrl) return false
        if (!q) return true
        const hay = [p.name, p.lot, ...(p.aka || [])].join(' ').toLowerCase()
        return hay.includes(q)
      })
      .slice()
      .sort((a, b) => {
        if (Boolean(a.coaUrl) !== Boolean(b.coaUrl)) return a.coaUrl ? -1 : 1
        return String(a.name).localeCompare(String(b.name))
      })
  }, [products, query, filter])

  const availableCount = (products || []).filter((p) => p.coaUrl).length

  return (
    <main className="coa-lib-page">
      <div className="wrap coa-lib-wrap">
        <header className="coa-lib-hero">
          <span className="eyebrow">Compliance</span>
          <h1>
            COA <span className="gold">Library</span>
          </h1>
          <p>
            Browse Certificates of Analysis for Primal Peps research compounds.
            Each COA documents purity and identity for the listed manufacturing
            lot.
          </p>
        </header>

        <div className="coa-lib-toolbar">
          <label className="coa-lib-search">
            <span className="sr-only">Search products</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product or lot…"
            />
          </label>
          <div className="coa-lib-filters" role="tablist" aria-label="COA filter">
            {[
              { id: 'all', label: 'All' },
              { id: 'available', label: 'Available' },
              { id: 'pending', label: 'Pending' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={filter === f.id}
                className={`coa-lib-chip${filter === f.id ? ' active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="muted coa-lib-status">Loading certificates…</p>
        ) : null}
        {error ? <p className="form-error coa-lib-status">{error}</p> : null}

        {!loading && !error ? (
          <div className="coa-lib-table-wrap">
            <table className="coa-lib-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Lot</th>
                  <th>Purity</th>
                  <th>Status</th>
                  <th>Certificate</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="coa-lib-empty">
                      No products match this search.
                    </td>
                  </tr>
                ) : (
                  rows.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <div className="coa-lib-product">
                          <strong>{p.name}</strong>
                          {p.coaUrl ? (
                            <span className="coa-lib-badge">Current</span>
                          ) : null}
                        </div>
                        {p.categoryLabel ? (
                          <span className="coa-lib-cat">{p.categoryLabel}</span>
                        ) : null}
                      </td>
                      <td className="coa-lib-mono">{p.lot || '—'}</td>
                      <td>{p.purity || '99%+'}</td>
                      <td>
                        {p.coaUrl ? (
                          <span className="coa-lib-status-pill ok">Available</span>
                        ) : (
                          <span className="coa-lib-status-pill">Pending</span>
                        )}
                      </td>
                      <td>
                        <CoaAction
                          productName={p.name}
                          coaUrl={p.coaUrl}
                          className="coa-lib-action"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        <p className="coa-lib-note">
          {availableCount} certificate
          {availableCount === 1 ? '' : 's'} available.
          {' '}
          Research use only · 18+. For product pages, open any compound and use
          View COA when ready.
        </p>

        <p className="coa-lib-back">
          <Link to="/">← Back to shop</Link>
          {' · '}
          <Link to="/track-order">Track order</Link>
        </p>
      </div>
    </main>
  )
}
