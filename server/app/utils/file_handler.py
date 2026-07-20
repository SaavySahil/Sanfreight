import os
import uuid
from flask import current_app
from werkzeug.utils import secure_filename

ALLOWED_RESUME_EXTENSIONS = {'pdf', 'doc', 'docx'}


def _allowed_file(filename, allowed):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed


def save_resume(file):
    if not file or file.filename == '':
        return None
    if not _allowed_file(file.filename, ALLOWED_RESUME_EXTENSIONS):
        raise ValueError('Invalid file type. Allowed: pdf, doc, docx')

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f'{uuid.uuid4()}.{ext}'
    folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'resumes')
    os.makedirs(folder, exist_ok=True)
    file.save(os.path.join(folder, filename))
    return filename


def get_resume_path(filename):
    if not filename:
        return None
    return os.path.join(current_app.config['UPLOAD_FOLDER'], 'resumes', filename)


def save_image(file):
    if not file or file.filename == '':
        return None
    allowed = {'jpg', 'jpeg', 'png', 'webp'}
    if not _allowed_file(file.filename, allowed):
        raise ValueError('Invalid file type. Allowed: jpg, jpeg, png, webp')

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f'{uuid.uuid4()}.{ext}'
    folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'images')
    os.makedirs(folder, exist_ok=True)
    file.save(os.path.join(folder, filename))
    return filename
