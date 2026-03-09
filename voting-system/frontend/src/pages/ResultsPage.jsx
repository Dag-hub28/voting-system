import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api/axios'
import './ResultsPage.css'

const COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626', '#7c3aed', '#0891b2']

export default function ResultsPage() {
  const [results, setResults] = useState([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [election, setElection] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/votes/results')
      .then(res => {
        setResults(res.data.results)
        setTotalVotes(res.data.total_votes)
        setElection(res.data.election)
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to load results')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="spinner" />

  if (error) {
    return (
      <div className="results-page container">
        <div className="alert alert-info" style={{ marginTop: '2rem' }}>
          🔒 {error}
        </div>
      </div>
    )
  }

  const winner = results[0]

  return (
    <div className="results-page container">
      <div className="results-header">
        <h1>📊 Election Results</h1>
        <p className="results-subtitle">{election?.title || 'General Election'}</p>
        <div className="total-votes-badge">
          Total Votes Cast: <strong>{totalVotes}</strong>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="empty-state">No votes have been cast yet.</div>
      ) : (
        <>
          {winner && (
            <div className="winner-card card">
              <div className="winner-crown">👑</div>
              <div className="winner-avatar">
                {winner.image_url
                  ? <img src={winner.image_url} alt={winner.name} />
                  : <span>{winner.name.charAt(0)}</span>
                }
              </div>
              <div className="winner-info">
                <div className="winner-label">Leading Candidate</div>
                <h2>{winner.name}</h2>
                <span className="badge badge-blue">{winner.party}</span>
                <div className="winner-stats">
                  <span>{winner.vote_count} votes</span>
                  <span className="dot">·</span>
                  <span>{winner.percentage}%</span>
                </div>
              </div>
            </div>
          )}

          <div className="chart-section card">
            <h3>Vote Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={results} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
                <Tooltip
                  formatter={(value, name) => [value, 'Votes']}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="vote_count" radius={[6, 6, 0, 0]}>
                  {results.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="results-list">
            {results.map((c, i) => (
              <div key={c.id} className="result-row card">
                <div className="result-rank">{i + 1}</div>
                <div className="result-avatar">
                  {c.image_url
                    ? <img src={c.image_url} alt={c.name} />
                    : <span>{c.name.charAt(0)}</span>
                  }
                </div>
                <div className="result-info">
                  <div className="result-name">{c.name}</div>
                  <div className="result-party">{c.party}</div>
                  <div className="result-bar-wrap">
                    <div
                      className="result-bar"
                      style={{
                        width: `${c.percentage}%`,
                        background: COLORS[i % COLORS.length],
                      }}
                    />
                  </div>
                </div>
                <div className="result-stats">
                  <div className="result-count">{c.vote_count}</div>
                  <div className="result-pct">{c.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
