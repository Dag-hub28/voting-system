from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import os

db = SQLAlchemy()
jwt = JWTManager()
bcrypt = Bcrypt()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATIC_DIR = os.path.join(BASE_DIR, "static")


def create_app():
    app = Flask(__name__, static_folder=STATIC_DIR, static_url_path="/static")

    # Use SQLite — no PostgreSQL needed
    db_path = os.path.join(BASE_DIR, "voting.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY", "dev-secret-key-change-in-prod")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 3600

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes.auth import auth_bp
    from app.routes.candidates import candidates_bp
    from app.routes.votes import votes_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(candidates_bp, url_prefix="/api/candidates")
    app.register_blueprint(votes_bp, url_prefix="/api/votes")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Serve the single-page frontend
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_frontend(path):
        index = os.path.join(STATIC_DIR, "index.html")
        if os.path.exists(index):
            return send_from_directory(STATIC_DIR, "index.html")
        return "<h2>Frontend not found. Place index.html in backend/static/</h2>", 404

    return app
