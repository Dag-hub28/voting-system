from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db, bcrypt
from app.models import User, Candidate, Vote, Election
from functools import wraps

admin_bp = Blueprint("admin", __name__)


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper


# ── Candidates ──────────────────────────────────────────────────────────────

@admin_bp.route("/candidates", methods=["GET"])
@admin_required
def list_candidates():
    candidates = Candidate.query.all()
    return jsonify({"candidates": [c.to_dict(include_votes=True) for c in candidates]}), 200


@admin_bp.route("/candidates", methods=["POST"])
@admin_required
def add_candidate():
    data = request.get_json()
    name = data.get("name", "").strip()
    party = data.get("party", "").strip()
    description = data.get("description", "").strip()
    image_url = data.get("image_url", "").strip()

    if not name or not party:
        return jsonify({"error": "Name and party are required"}), 400

    candidate = Candidate(name=name, party=party, description=description, image_url=image_url)
    db.session.add(candidate)
    db.session.commit()
    return jsonify({"message": "Candidate added", "candidate": candidate.to_dict()}), 201


@admin_bp.route("/candidates/<int:candidate_id>", methods=["PUT"])
@admin_required
def update_candidate(candidate_id):
    candidate = Candidate.query.get_or_404(candidate_id)
    data = request.get_json()

    candidate.name = data.get("name", candidate.name).strip()
    candidate.party = data.get("party", candidate.party).strip()
    candidate.description = data.get("description", candidate.description)
    candidate.image_url = data.get("image_url", candidate.image_url)
    candidate.is_active = data.get("is_active", candidate.is_active)

    db.session.commit()
    return jsonify({"message": "Candidate updated", "candidate": candidate.to_dict()}), 200


@admin_bp.route("/candidates/<int:candidate_id>", methods=["DELETE"])
@admin_required
def delete_candidate(candidate_id):
    candidate = Candidate.query.get_or_404(candidate_id)
    db.session.delete(candidate)
    db.session.commit()
    return jsonify({"message": "Candidate deleted"}), 200


# ── Election control ─────────────────────────────────────────────────────────

@admin_bp.route("/election", methods=["GET"])
@admin_required
def get_election():
    election = Election.query.first()
    if not election:
        election = Election(title="General Election", is_open=True, results_visible=False)
        db.session.add(election)
        db.session.commit()
    return jsonify({"election": election.to_dict()}), 200


@admin_bp.route("/election", methods=["PUT"])
@admin_required
def update_election():
    election = Election.query.first()
    if not election:
        election = Election()
        db.session.add(election)

    data = request.get_json()
    if "title" in data:
        election.title = data["title"]
    if "is_open" in data:
        election.is_open = data["is_open"]
    if "results_visible" in data:
        election.results_visible = data["results_visible"]

    db.session.commit()
    return jsonify({"message": "Election updated", "election": election.to_dict()}), 200


# ── Users / Stats ─────────────────────────────────────────────────────────────

@admin_bp.route("/stats", methods=["GET"])
@admin_required
def stats():
    total_users = User.query.filter_by(is_admin=False).count()
    total_votes = Vote.query.count()
    total_candidates = Candidate.query.filter_by(is_active=True).count()
    return jsonify({
        "total_users": total_users,
        "total_votes": total_votes,
        "total_candidates": total_candidates,
        "turnout": round(total_votes / total_users * 100, 2) if total_users > 0 else 0,
    }), 200


@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    users = User.query.filter_by(is_admin=False).all()
    return jsonify({"users": [u.to_dict() for u in users]}), 200
