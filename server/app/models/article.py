import uuid
import re
from datetime import datetime
from ..extensions import db


def _slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    return text


class Article(db.Model):
    __tablename__ = 'article'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(500), nullable=False)
    slug = db.Column(db.String(500), unique=True, nullable=False)
    summary = db.Column(db.Text)
    body = db.Column(db.Text)
    thumbnail = db.Column(db.String(255))
    category = db.Column(db.String(100))
    author = db.Column(db.String(255), default='Sanfreight Team')
    is_published = db.Column(db.Boolean, default=False)
    published_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __init__(self, **kwargs):
        if 'slug' not in kwargs and 'title' in kwargs:
            kwargs['slug'] = self._generate_slug(kwargs['title'])
        super().__init__(**kwargs)

    @staticmethod
    def _generate_slug(title):
        base = _slugify(title)
        slug = base
        counter = 1
        while Article.query.filter_by(slug=slug).first():
            slug = f'{base}-{counter}'
            counter += 1
        return slug

    def to_dict(self, full=False):
        data = {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'summary': self.summary,
            'thumbnail': self.thumbnail,
            'category': self.category,
            'author': self.author,
            'is_published': self.is_published,
            'published_at': self.published_at.isoformat() if self.published_at else None,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat(),
        }
        if full:
            data['body'] = self.body
        return data
