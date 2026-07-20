from flask import Blueprint, request, jsonify, send_file, current_app
import os
from ..extensions import db
from ..models.application import JobApplication
from ..models.job import Job
from ..utils.auth_middleware import token_required
from ..utils.file_handler import save_resume, get_resume_path

applications_bp = Blueprint('applications', __name__)


# ── PUBLIC ───────────────────────────────────────────────────────────────────

@applications_bp.route('/applications', methods=['POST'])
def submit_application():
    job_id = request.form.get('job_id')
    name = request.form.get('name', '').strip()
    email = request.form.get('email', '').strip()
    phone = request.form.get('phone', '').strip()
    cover_letter = request.form.get('cover_letter', '').strip()

    if not name or not email:
        return jsonify({'error': 'Name and email are required'}), 400

    job = None
    job_title_snapshot = None
    if job_id:
        job = Job.query.get(job_id)
        if job:
            job_title_snapshot = job.title

    resume_filename = None
    if 'resume' in request.files:
        try:
            resume_filename = save_resume(request.files['resume'])
        except ValueError as e:
            return jsonify({'error': str(e)}), 400

    app_record = JobApplication(
        job_id=job_id if job else None,
        job_title=job_title_snapshot,
        applicant_name=name,
        email=email,
        phone=phone or None,
        cover_note=cover_letter or None,
        resume_path=resume_filename,
    )
    db.session.add(app_record)
    db.session.commit()
    return jsonify({'message': 'Application submitted successfully'}), 201


# ── ADMIN ────────────────────────────────────────────────────────────────────

@applications_bp.route('/admin/applications', methods=['GET'])
@token_required
def admin_list_applications(current_user):
    apps = JobApplication.query.order_by(JobApplication.applied_at.desc()).all()
    return jsonify([a.to_dict() for a in apps])


@applications_bp.route('/admin/applications/<app_id>/resume', methods=['GET'])
@token_required
def download_resume(current_user, app_id):
    record = JobApplication.query.get_or_404(app_id)
    if not record.resume_path:
        return jsonify({'error': 'No resume on file'}), 404
    path = get_resume_path(record.resume_path)
    if not os.path.exists(path):
        return jsonify({'error': 'Resume file not found'}), 404
    return send_file(path, as_attachment=True)


@applications_bp.route('/admin/applications/<app_id>', methods=['DELETE'])
@token_required
def delete_application(current_user, app_id):
    record = JobApplication.query.get_or_404(app_id)
    db.session.delete(record)
    db.session.commit()
    return jsonify({'message': 'Deleted'})