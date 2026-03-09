import { useState, useEffect } from 'react'
import api from '../api/axios'
import './AdminPage.css'

const emptyForm = { name: '', party: '', description: '', image_url: '' }

export default function AdminPage() {
  const [tab, setTab] = useState('candidates')
  const [candidates, setCandidates] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState(null)
  const [election, setElection] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAll = async () => {
    setLoading(true)
    try {
      const [cRes, uRes, sRes, eRes] = await Promise.all([
        api.get('/admin/candidates'),
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/election'),
      ])
      setCandidates(cRes.data.candidates)
      setUsers(uRes.data.users)
      setStats(sRes.data)
      setElection(eRes.data.election)
    } catch {
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/admin/candidates/${editId}`, form)
        setSuccess('Candidate updated successfully')
      } else {
        await api.post('/admin/candidates', form)
        setSuccess('Candidate added successfully')
      }
      setForm(emptyForm)
      setEditId(null)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save candidate')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (c) => {
    setEditId(c.id)
    setForm({ name: c.name, party: c.party, description: c.description || '', image_url: c.image_url || '' })
    setTab('candidates')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this candidate?')) return
    try {
      await api.delete(`/admin/candidates/${id}`)
      setSuccess('Candidate deleted')
      fetchAll()
    } catch {
      setError('Failed to delete candidate')
    }
  }

  const handleToggleActive = async (c) => {
    try {
      await api.put(`/admin/candidates/${c.id}`, { ...c, is_active: !c.is_active })
      fetchAll()
    } catch {
      setError('Failed to update candidate')
    }
  }

  const handleElectionUpdate = async (field, value) => {
    try {
      await api.put('/admin/election', { [field]: value })
      setElection({ ...election, [field]: value })
      setSuccess('Election settings updated')
    } catch {
      setError('Failed to update election')
    }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        {stats && (
          <div className="stats-row">
            <div className="stat-card card">
              <div className="stat-value">{stats.total_users}</div>
              <div className="stat-label">Registered Voters</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{stats.total_votes}</div>
              <div className="stat-label">Votes Cast</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{stats.total_candidates}</div>
              <div className="stat-label">Candidates</div>
            </div>
            <div className="stat-card card">
              <div className="stat-value">{stats.turnout}%</div>
              <div className="stat-label">Voter Turnout</div>
            </div>
          </div>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Election Controls */}
      {election && (
        <div className="election-controls card">
          <h3>🗳️ Election Controls — <em>{election.title}</em></h3>
          <div className="controls-row">
            <label className="toggle-label">
              <span>Voting Open</span>
              <button
                className={`toggle-btn ${election.is_open ? 'on' : 'off'}`}
                onClick={() => handleElectionUpdate('is_open', !election.is_open)}
              >
                {election.is_open ? '✅ Open' : '🔒 Closed'}
              </button>
            </label>
            <label className="toggle-label">
              <span>Results Visible</span>
              <button
                className={`toggle-btn ${election.results_visible ? 'on' : 'off'}`}
                onClick={() => handleElectionUpdate('results_visible', !election.results_visible)}
              >
                {election.results_visible ? '👁️ Visible' : '🙈 Hidden'}
              </button>
            </label>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button className={`tab-btn ${tab === 'candidates' ? 'active' : ''}`} onClick={() => setTab('candidates')}>
          Candidates
        </button>
        <button className={`tab-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          Voters ({users.length})
        </button>
      </div>

      {tab === 'candidates' && (
        <div className="admin-content">
          {/* Add/Edit Form */}
          <div className="card form-section">
            <h3>{editId ? '✏️ Edit Candidate' : '➕ Add Candidate'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleFormChange} placeholder="Candidate name" required />
                </div>
                <div className="form-group">
                  <label>Party *</label>
                  <input name="party" value={form.party} onChange={handleFormChange} placeholder="Party name" required />
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Brief bio or platform..." rows={3} />
              </div>
              <div className="form-group">
                <label>Photo URL</label>
                <input name="image_url" value={form.image_url} onChange={handleFormChange} placeholder="https://..." />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Update Candidate' : 'Add Candidate'}
                </button>
                {editId && (
                  <button type="button" className="btn btn-outline" onClick={() => { setEditId(null); setForm(emptyForm) }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Candidates List */}
          <div className="candidates-table card">
            <h3>All Candidates ({candidates.length})</h3>
            {candidates.length === 0 ? (
              <p className="empty-msg">No candidates yet. Add one above.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Party</th>
                    <th>Votes</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map(c => (
                    <tr key={c.id}>
                      <td>
                        <div className="table-candidate">
                          <div className="table-avatar">
                            {c.image_url ? <img src={c.image_url} alt={c.name} /> : c.name.charAt(0)}
                          </div>
                          {c.name}
                        </div>
                      </td>
                      <td>{c.party}</td>
                      <td><strong>{c.vote_count}</strong></td>
                      <td>
                        <span className={`badge ${c.is_active ? 'badge-green' : 'badge-red'}`}>
                          {c.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="btn btn-outline btn-xs" onClick={() => handleEdit(c)}>Edit</button>
                          <button className="btn btn-xs" style={{ background: c.is_active ? '#fef3c7' : '#dcfce7', color: c.is_active ? '#92400e' : '#166534' }} onClick={() => handleToggleActive(c)}>
                            {c.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn btn-danger btn-xs" onClick={() => handleDelete(c.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <h3>Registered Voters</h3>
          {users.length === 0 ? (
            <p className="empty-msg">No voters registered yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Voted</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.has_voted ? 'badge-green' : 'badge-blue'}`}>
                        {u.has_voted ? '✅ Voted' : 'Not yet'}
                      </span>
                    </td>
                    <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
