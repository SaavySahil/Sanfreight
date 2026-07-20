import uuid
import json
from datetime import datetime
from ..extensions import db


class Project(db.Model):
    __tablename__ = 'project'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(255), nullable=False)
    slug = db.Column(db.String(255), unique=True, nullable=False)
    category = db.Column(db.String(100))
    status = db.Column(db.Enum('ongoing', 'completed', name='project_status'), default='ongoing')
    location = db.Column(db.String(255))
    scope = db.Column(db.Text)
    size = db.Column(db.String(100))
    client_name = db.Column(db.String(255))
    thumbnail = db.Column(db.String(255))
    is_featured = db.Column(db.Boolean, default=False)
    services = db.Column(db.Text)
    partners = db.Column(db.Text)
    story_headline = db.Column(db.String(500))
    story_body = db.Column(db.Text)
    client_testimonial = db.Column(db.Text)
    gallery_json = db.Column(db.Text, default='[]')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def get_gallery(self):
        try:
            return json.loads(self.gallery_json or '[]')
        except Exception:
            return []

    def set_gallery(self, images):
        self.gallery_json = json.dumps(images or [])

    def to_dict(self, full=False):
        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'category': self.category,
            'status': self.status,
            'location': self.location,
            'scope': self.scope,
            'size': self.size,
            'client_name': self.client_name,
            'thumbnail': self.thumbnail,
            'is_featured': self.is_featured,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
        if full:
            data.update({
                'services': self.services,
                'partners': self.partners,
                'story_headline': self.story_headline,
                'story_body': self.story_body,
                'client_testimonial': self.client_testimonial,
                'gallery': self.get_gallery(),
            })
        return data
