from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.job import Job
from ..utils.auth_middleware import token_required

jobs_bp = Blueprint('jobs', __name__)


# ── PUBLIC ──────────────────────────────────────────────────────────────────

@jobs_bp.route('/jobs', methods=['GET'])
def get_jobs():
    jobs = Job.query.filter_by(is_active=True).order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs])


@jobs_bp.route('/jobs/<slug>', methods=['GET'])
def get_job(slug):
    job = Job.query.filter_by(slug=slug, is_active=True).first_or_404()
    return jsonify(job.to_dict())


# ── ADMIN ────────────────────────────────────────────────────────────────────

@jobs_bp.route('/admin/jobs', methods=['GET'])
@token_required
def admin_list_jobs(current_user):
    jobs = Job.query.order_by(Job.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs])


@jobs_bp.route('/admin/jobs', methods=['POST'])
@token_required
def admin_create_job(current_user):
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    job = Job(
        title=data['title'],
        department=data.get('department'),
        location=data.get('location'),
        type=data.get('type', 'full-time'),
        description=data.get('description'),
        requirements=data.get('requirements'),
        is_active=data.get('is_active', True),
    )
    db.session.add(job)
    db.session.commit()
    return jsonify(job.to_dict()), 201


@jobs_bp.route('/admin/jobs/<job_id>', methods=['PUT'])
@token_required
def admin_update_job(current_user, job_id):
    job = Job.query.get_or_404(job_id)
    data = request.get_json()

    for field in ['title', 'department', 'location', 'type', 'description', 'requirements', 'is_active']:
        if field in data:
            setattr(job, field, data[field])

    db.session.commit()
    return jsonify(job.to_dict())


@jobs_bp.route('/admin/jobs/<job_id>', methods=['DELETE'])
@token_required
def admin_delete_job(current_user, job_id):
    job = Job.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job deleted'})
