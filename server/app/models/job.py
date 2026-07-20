import uuid
import re
from datetime import datetime
from ..extensions import db


def _slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text


class Job(db.Model):
    __tablename__ = 'job'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    department = db.Column(db.String(100))
    location = db.Column(db.String(255))
    type = db.Column(db.Enum('full-time', 'part-time', 'contract', name='job_type'), default='full-time')
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    applications = db.relationship('JobApplication', backref='job', lazy=True)

    def __init__(self, **kwargs):
        if 'slug' not in kwargs and 'title' in kwargs:
            kwargs['slug'] = self._generate_slug(kwargs['title'])
        super().__init__(**kwargs)

    @staticmethod
    def _generate_slug(title):
        base = _slugify(title)
        slug = base
        counter = 1
        while Job.query.filter_by(slug=slug).first():
            slug = f'{base}-{counter}'
            counter += 1
        return slug

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'department': self.department,
            'location': self.location,
            'type': self.type,
            'description': self.description,
            'requirements': self.requirements,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
