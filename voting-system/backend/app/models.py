from app import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    has_voted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    vote = db.relationship("Vote", backref="voter", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "is_admin": self.is_admin,
            "has_voted": self.has_voted,
            "created_at": self.created_at.isoformat(),
        }


class Candidate(db.Model):
    __tablename__ = "candidates"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    party = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    image_url = db.Column(db.String(500), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    votes = db.relationship("Vote", backref="candidate", lazy=True)

    @property
    def vote_count(self):
        return len(self.votes)

    def to_dict(self, include_votes=False):
        data = {
            "id": self.id,
            "name": self.name,
            "party": self.party,
            "description": self.description,
            "image_url": self.image_url,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat(),
        }
        if include_votes:
            data["vote_count"] = self.vote_count
        return data


class Vote(db.Model):
    __tablename__ = "votes"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    candidate_id = db.Column(db.Integer, db.ForeignKey("candidates.id"), nullable=False)
    voted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "candidate_id": self.candidate_id,
            "voted_at": self.voted_at.isoformat(),
        }


class Election(db.Model):
    __tablename__ = "elections"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False, default="General Election")
    is_open = db.Column(db.Boolean, default=True)
    results_visible = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "is_open": self.is_open,
            "results_visible": self.results_visible,
        }
