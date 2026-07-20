import jwt
from functools import wraps
from flask import request, jsonify, current_app
from ..models.admin import AdminUser


def decode_token(token):
    try:
        payload = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # Check Authorization header
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]

        # Fall back to query param (needed for window.open() resume downloads)
        if not token:
            token = request.args.get('token')

        if not token:
            return jsonify({'error': 'Authorization token required'}), 401

        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        current_user = AdminUser.query.get(payload.get('user_id'))
        if not current_user:
            return jsonify({'error': 'User not found'}), 401

        return f(current_user, *args, **kwargs)
    return decorated
