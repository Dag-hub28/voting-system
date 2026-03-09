"""Seed the database with an admin user and initial election."""
import os
from app import create_app, db, bcrypt
from app.models import User, Election

def seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        admin_email = os.getenv("ADMIN_EMAIL", "admin@voting.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "Admin@1234")

        if not User.query.filter_by(email=admin_email).first():
            pw_hash = bcrypt.generate_password_hash(admin_password).decode("utf-8")
            admin = User(
                username="admin",
                email=admin_email,
                password_hash=pw_hash,
                is_admin=True,
            )
            db.session.add(admin)
            print(f"Admin user created: {admin_email} / {admin_password}")
        else:
            print("Admin user already exists.")

        if not Election.query.first():
            election = Election(title="General Election 2024", is_open=True, results_visible=False)
            db.session.add(election)
            print("Default election created.")

        db.session.commit()
        print("Seeding complete.")


if __name__ == "__main__":
    seed()
