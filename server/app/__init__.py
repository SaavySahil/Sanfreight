import os
import re
from flask import Flask, request, make_response
from flask_cors import CORS
from .extensions import db, migrate
from .config import config

# Origins always allowed regardless of env var
_ALWAYS_ALLOWED = re.compile(
    r'^https?://(localhost|127\.0\.0\.1)(:\d+)?$'
    r'|^https://[\w-]+\.vercel\.app$'
    r'|^https://[\w-]+\.pages\.dev$'
    r'|^https://[\w-]+\.onrender\.com$'
    r'|^https://[\w-]+\.github\.io$'
)


def _is_allowed_origin(origin):
    if not origin:
        return False
    # Check regex patterns
    if _ALWAYS_ALLOWED.match(origin):
        return True
    return False


def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')

    app = Flask(__name__)
    app.config.from_object(config.get(config_name, config['default']))

    # Ensure upload folder exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes'), exist_ok=True)
    os.makedirs(os.path.join(app.config['UPLOAD_FOLDER'], 'images'), exist_ok=True)

    # Extensions
    db.init_app(app)
    migrate.init_app(app, db)

    @app.before_request
    def handle_options():
        if request.method == 'OPTIONS':
            origin = request.headers.get('Origin', '')
            if _is_allowed_origin(origin):
                resp = make_response('', 204)
                resp.headers['Access-Control-Allow-Origin'] = origin
                resp.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
                resp.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
                resp.headers['Access-Control-Max-Age'] = '3600'
                return resp

    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get('Origin', '')
        if _is_allowed_origin(origin):
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
            response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS, PATCH'
        return response

    # Register blueprints
    from .routes.auth import auth_bp
    from .routes.projects import projects_bp
    from .routes.jobs import jobs_bp
    from .routes.applications import applications_bp
    from .routes.content import content_bp
    from .routes.articles import articles_bp

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(projects_bp, url_prefix='/api')
    app.register_blueprint(jobs_bp, url_prefix='/api')
    app.register_blueprint(applications_bp, url_prefix='/api')
    app.register_blueprint(content_bp, url_prefix='/api')
    app.register_blueprint(articles_bp, url_prefix='/api')

    # Serve uploaded files
    from flask import send_from_directory

    @app.route('/api/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Health check endpoint
    @app.route('/health')
    def health():
        return {'status': 'ok'}, 200

    # Auto-seed admin user and content fields — retry up to 3× for slow DB wakeup
    import time

    def _init_db():
        for attempt in range(3):
            try:
                db.create_all()
                _seed_defaults()
                app.logger.info('DB initialized successfully')
                return
            except Exception as e:
                app.logger.error(f'DB init attempt {attempt + 1}/3 failed: {e}')
                if attempt < 2:
                    time.sleep(5)
        app.logger.error('DB init failed after 3 attempts — tables may not exist')

    with app.app_context():
        _init_db()

    return app


def _seed_defaults():
    from .models.admin import AdminUser
    from .models.content import ContentField

    if AdminUser.query.count() == 0:
        admin = AdminUser(email='admin@sanfreight.com')
        admin.set_password('Admin@123')
        db.session.add(admin)

    default_fields = {
        'home_hero_tagline': 'Connecting Your Business To Opportunities Across Global Markets',
        'about_summary': 'Sanfreight Logistics delivers integrated logistics solutions that simplify global trade — from air and ocean freight to customs clearance and end-to-end supply chain management.',
        'projects_hero_tagline': 'Our Portfolio of Excellence',
        'careers_hero_tagline': 'Build Your Career With Us',
    }
    for key, value in default_fields.items():
        if not ContentField.query.get(key):
            db.session.add(ContentField(key=key, value=value))

    db.session.commit()
