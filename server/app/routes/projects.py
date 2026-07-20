import re
from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.project import Project
from ..utils.auth_middleware import token_required
from ..utils.file_handler import save_image


def _slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text).strip('-')
    return text


def _unique_slug(base):
    slug = base
    counter = 1
    while Project.query.filter_by(slug=slug).first():
        slug = f'{base}-{counter}'
        counter += 1
    return slug

projects_bp = Blueprint('projects', __name__)


# ── PUBLIC ──────────────────────────────────────────────────────────────────

@projects_bp.route('/projects', methods=['GET'])
def get_projects():
    query = Project.query
    status = request.args.get('status')
    is_featured = request.args.get('is_featured')

    if status in ('ongoing', 'completed'):
        query = query.filter_by(status=status)
    if is_featured == 'true':
        query = query.filter_by(is_featured=True)

    projects = query.order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict() for p in projects])


@projects_bp.route('/projects/<slug>', methods=['GET'])
def get_project(slug):
    project = Project.query.filter_by(slug=slug).first_or_404()
    return jsonify(project.to_dict(full=True))


# ── ADMIN ────────────────────────────────────────────────────────────────────

@projects_bp.route('/admin/projects', methods=['GET'])
@token_required
def admin_list_projects(current_user):
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict(full=True) for p in projects])


@projects_bp.route('/admin/projects', methods=['POST'])
@token_required
def admin_create_project(current_user):
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    slug = data.get('slug') or _unique_slug(_slugify(data['title']))
    project = Project(
        title=data['title'],
        slug=slug,
        category=data.get('category'),
        status=data.get('status', 'ongoing'),
        location=data.get('location'),
        scope=data.get('scope'),
        size=data.get('size'),
        client_name=data.get('client_name'),
        services=data.get('services'),
        partners=data.get('partners'),
        story_headline=data.get('story_headline'),
        story_body=data.get('story_body'),
        client_testimonial=data.get('client_testimonial'),
        thumbnail=data.get('thumbnail'),
        is_featured=data.get('is_featured', False),
    )
    if data.get('gallery'):
        project.set_gallery(data['gallery'])

    try:
        db.session.add(project)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        from flask import current_app
        current_app.logger.error(f'Project create error: {e}')
        return jsonify({'error': str(e)}), 500
    return jsonify(project.to_dict(full=True)), 201


@projects_bp.route('/admin/projects/<project_id>', methods=['PUT'])
@token_required
def admin_update_project(current_user, project_id):
    project = Project.query.get_or_404(project_id)
    data = request.get_json()

    fields = ['title', 'category', 'status', 'location', 'scope', 'size',
              'client_name', 'services', 'partners', 'story_headline',
              'story_body', 'client_testimonial', 'thumbnail', 'is_featured']

    for field in fields:
        if field in data:
            setattr(project, field, data[field])

    if 'gallery' in data:
        project.set_gallery(data['gallery'])

    db.session.commit()
    return jsonify(project.to_dict(full=True))


@projects_bp.route('/admin/projects/<project_id>', methods=['DELETE'])
@token_required
def admin_delete_project(current_user, project_id):
    project = Project.query.get_or_404(project_id)
    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted'})


@projects_bp.route('/admin/upload', methods=['POST'])
@token_required
def admin_upload_image(current_user):
    if 'image' not in request.files:
        return jsonify({'error': 'No image file'}), 400
    try:
        filename = save_image(request.files['image'])
        return jsonify({'filename': filename})
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
