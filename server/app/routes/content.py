from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.content import ContentField
from ..utils.auth_middleware import token_required

content_bp = Blueprint('content', __name__)


# ── PUBLIC ───────────────────────────────────────────────────────────────────

@content_bp.route('/content/<key>', methods=['GET'])
def get_content(key):
    field = ContentField.query.get_or_404(key)
    return jsonify(field.to_dict())


@content_bp.route('/content', methods=['GET'])
def get_all_content():
    fields = ContentField.query.all()
    return jsonify({f.key: f.value for f in fields})


# ── ADMIN ────────────────────────────────────────────────────────────────────

@content_bp.route('/admin/content', methods=['GET'])
@token_required
def admin_list_content(current_user):
    fields = ContentField.query.order_by(ContentField.key).all()
    return jsonify([f.to_dict() for f in fields])


@content_bp.route('/admin/content/<key>', methods=['PUT'])
@token_required
def admin_update_content(current_user, key):
    field = ContentField.query.get_or_404(key)
    data = request.get_json()

    if 'value' in data:
        field.value = data['value']
    if 'label' in data:
        field.label = data['label']

    db.session.commit()
    return jsonify(field.to_dict())


@content_bp.route('/admin/content', methods=['POST'])
@token_required
def admin_create_content(current_user):
    data = request.get_json()
    if not data or not data.get('key'):
        return jsonify({'error': 'key is required'}), 400

    if ContentField.query.get(data['key']):
        return jsonify({'error': 'Key already exists'}), 409

    field = ContentField(
        key=data['key'],
        value=data.get('value', ''),
        label=data.get('label', data['key']),
    )
    db.session.add(field)
    db.session.commit()
    return jsonify(field.to_dict()), 201
