from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models import User, Candidate, Vote, Election

votes_bp = Blueprint("votes", __name__)


@votes_bp.route("/cast", methods=["POST"])
@jwt_required()
def cast_vote():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    if user.has_voted:
        return jsonify({"error": "You have already voted"}), 403

    # Check if election is open
    election = Election.query.first()
    if election and not election.is_open:
        return jsonify({"error": "Voting is currently closed"}), 403

    data = request.get_json()
    candidate_id = data.get("candidate_id")

    if not candidate_id:
        return jsonify({"error": "candidate_id is required"}), 400

    candidate = Candidate.query.filter_by(id=candidate_id, is_active=True).first()
    if not candidate:
        return jsonify({"error": "Candidate not found or inactive"}), 404

    # Double-check no existing vote (extra security)
    existing_vote = Vote.query.filter_by(user_id=user_id).first()
    if existing_vote:
        return jsonify({"error": "You have already voted"}), 403

    vote = Vote(user_id=user_id, candidate_id=candidate_id)
    user.has_voted = True
    db.session.add(vote)
    db.session.commit()

    return jsonify({"message": "Vote cast successfully", "vote": vote.to_dict()}), 201


@votes_bp.route("/results", methods=["GET"])
@jwt_required()
def get_results():
    election = Election.query.first()

    # Allow results if election is closed OR results_visible is True
    if election and election.is_open and not election.results_visible:
        return jsonify({"error": "Results are not available yet"}), 403

    candidates = Candidate.query.filter_by(is_active=True).all()
    total_votes = Vote.query.count()

    results = []
    for c in candidates:
        count = c.vote_count
        results.append({
            **c.to_dict(),
            "vote_count": count,
            "percentage": round((count / total_votes * 100), 2) if total_votes > 0 else 0,
        })

    results.sort(key=lambda x: x["vote_count"], reverse=True)

    return jsonify({
        "results": results,
        "total_votes": total_votes,
        "election": election.to_dict() if election else None,
    }), 200


@votes_bp.route("/status", methods=["GET"])
@jwt_required()
def vote_status():
    election = Election.query.first()
    return jsonify({
        "election": election.to_dict() if election else {"is_open": True, "results_visible": False, "title": "General Election"},
    }), 200
