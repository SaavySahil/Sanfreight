import jwt
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from ..models.admin import AdminUser
from ..extensions import db

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Email and password required'}), 400

    try:
        user = AdminUser.query.filter_by(email=data['email']).first()
    except Exception as e:
        current_app.logger.error(f'DB error on login query: {e}')
        # Tables may not exist — create them and seed admin, then retry
        try:
            db.create_all()
            if AdminUser.query.count() == 0:
                admin = AdminUser(email='admin@sanfreight.com')
                admin.set_password('Admin@123')
                db.session.add(admin)
                db.session.commit()
            user = AdminUser.query.filter_by(email=data['email']).first()
        except Exception as e2:
            current_app.logger.error(f'DB recovery failed: {e2}')
            return jsonify({'error': 'Database unavailable', 'detail': str(e2)}), 503

    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    expiry = datetime.utcnow() + timedelta(hours=current_app.config['JWT_EXPIRY_HOURS'])
    token = jwt.encode(
        {'user_id': user.id, 'exp': expiry},
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )

    return jsonify({'token': token, 'user': user.to_dict()})


@auth_bp.route('/db-status', methods=['GET'])
def db_status():
    """Diagnostic endpoint — shows DB state without exposing secrets."""
    info = {}
    try:
        db.session.execute(db.text('SELECT 1'))
        info['db_connection'] = 'ok'
    except Exception as e:
        info['db_connection'] = f'ERROR: {e}'

    try:
        count = AdminUser.query.count()
        info['admin_users'] = count
    except Exception as e:
        info['admin_users'] = f'ERROR: {e}'

    db_url = current_app.config.get('SQLALCHEMY_DATABASE_URI', '')
    # Only show the scheme+host, not the password
    if db_url:
        from urllib.parse import urlparse
        parsed = urlparse(db_url)
        info['db_host'] = f'{parsed.scheme}://{parsed.hostname}/{parsed.path.lstrip("/")}'
    return jsonify(info)
