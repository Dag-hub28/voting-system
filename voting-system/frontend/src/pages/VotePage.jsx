import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import './VotePage.css'

export default function VotePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [candidates, setCandidates] = useState([])
  const [election, setElection] = useState(null)
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/candidates/'),
      api.get('/votes/status'),
    ]).then(([cRes, sRes]) => {
      setCandidates(cRes.data.candidates)
      setElection(sRes.data.election)
    }).catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const handleVote = async () => {
    if (!selected) return
    setSubmitting(true)
    setError('')
    try {
      await api.post('/votes/cast', { candidate_id: selected })
      setSuccess('✅ Your vote has been cast successfully!')
      setTimeout(() => navigate('/results'), 2000)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cast vote')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="spinner" />

  const electionClosed = election && !election.is_open
  const alreadyVoted = user?.has_voted

  return (
    <div className="vote-page container">
      <div className="vote-header">
        <h1>🗳️ {election?.title || 'General Election'}</h1>
        {electionClosed && (
          <div className="alert alert-info">Voting is currently closed.</div>
        )}
        {alreadyVoted && !success && (
          <div className="alert alert-success">
            You have already voted. <a href="/results">View results →</a>
          </div>
        )}
        {success && <div className="alert alert-success">{success}</div>}
        {error && <div className="alert alert-error">{error}</div>}
      </div>

      {!alreadyVoted && !electionClosed && (
        <>
          <p className="vote-instruction">Select a candidate and submit your vote. You can only vote once.</p>
          <div className="candidates-grid">
            {candidates.map(c => (
              <div
                key={c.id}
                className={`candidate-card card ${selected === c.id ? 'selected' : ''}`}
                onClick={() => setSelected(c.id)}
              >
                <div className="candidate-avatar">
                  {c.image_url
                    ? <img src={c.image_url} alt={c.name} />
                    : <span>{c.name.charAt(0)}</span>
                  }
                </div>
                <div className="candidate-info">
                  <h3>{c.name}</h3>
                  <span className="badge badge-blue">{c.party}</span>
                  {c.description && <p className="candidate-desc">{c.description}</p>}
                </div>
                <div className="candidate-select">
                  <div className={`radio-circle ${selected === c.id ? 'checked' : ''}`} />
                </div>
              </div>
            ))}
          </div>

          {candidates.length === 0 && (
            <div className="empty-state">
              <p>No candidates available yet.</p>
            </div>
          )}

          {candidates.length > 0 && (
            <div className="vote-action">
              <button
                className="btn btn-primary btn-vote"
                onClick={handleVote}
                disabled={!selected || submitting}
              >
                {submitting ? 'Submitting…' : '🗳️ Submit Vote'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
