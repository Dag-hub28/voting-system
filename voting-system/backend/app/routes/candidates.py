from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from app.models import Candidate, Vote, Election
from app import db

candidates_bp = Blueprint("candidates", __name__)


@candidates_bp.route("/", methods=["GET"])
@jwt_required()
def get_candidates():
    candidates = Candidate.query.filter_by(is_active=True).all()
    return jsonify({"candidates": [c.to_dict() for c in candidates]}), 200


@candidates_bp.route("/<int:candidate_id>", methods=["GET"])
@jwt_required()
def get_candidate(candidate_id):
    candidate = Candidate.query.get_or_404(candidate_id)
    return jsonify({"candidate": candidate.to_dict()}), 200
