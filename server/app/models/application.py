import uuid
from datetime import datetime
from ..extensions import db


class JobApplication(db.Model):
    __tablename__ = 'job_application'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = db.Column(db.String(36), db.ForeignKey('job.id', ondelete='SET NULL'), nullable=True)
    job_title = db.Column(db.String(255), nullable=False)  # snapshot at apply time
    applicant_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20))
    resume_path = db.Column(db.String(500))
    cover_note = db.Column(db.Text)
    applied_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'job_id': self.job_id,
            'job_title': self.job_title,
            'applicant_name': self.applicant_name,
            'email': self.email,
            'phone': self.phone,
            'cover_note': self.cover_note,
            'applied_at': self.applied_at.isoformat(),
            'has_resume': bool(self.resume_path),
        }
