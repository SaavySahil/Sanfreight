from datetime import datetime
from ..extensions import db


class ContentField(db.Model):
    __tablename__ = 'content_field'

    key = db.Column(db.String(100), primary_key=True)
    label = db.Column(db.String(255), nullable=True)
    value = db.Column(db.Text, nullable=False, default='')
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'key': self.key,
            'label': self.label or self.key,
            'value': self.value,
            'updated_at': self.updated_at.isoformat(),
        }
