from datetime import datetime
from flask import Blueprint, request, jsonify
from ..extensions import db
from ..models.article import Article
from ..utils.auth_middleware import token_required
from ..utils.file_handler import save_image

articles_bp = Blueprint('articles', __name__)


# ── PUBLIC ───────────────────────────────────────────────────────────────────

@articles_bp.route('/articles', methods=['GET'])
def get_articles():
    articles = (
        Article.query
        .filter_by(is_published=True)
        .order_by(Article.published_at.desc())
        .all()
    )
    return jsonify([a.to_dict() for a in articles])


@articles_bp.route('/articles/<slug>', methods=['GET'])
def get_article(slug):
    article = Article.query.filter_by(slug=slug, is_published=True).first_or_404()
    return jsonify(article.to_dict(full=True))


# ── ADMIN ────────────────────────────────────────────────────────────────────

@articles_bp.route('/admin/articles', methods=['GET'])
@token_required
def admin_list_articles(current_user):
    articles = Article.query.order_by(Article.created_at.desc()).all()
    return jsonify([a.to_dict() for a in articles])


@articles_bp.route('/admin/articles', methods=['POST'])
@token_required
def admin_create_article(current_user):
    data = request.get_json()
    if not data or not data.get('title'):
        return jsonify({'error': 'Title is required'}), 400

    is_published = data.get('is_published', False)
    published_at = None
    if is_published:
        # Allow backdating (e.g. migrating existing content) via an explicit
        # ISO published_at; default to now like before.
        if data.get('published_at'):
            try:
                published_at = datetime.fromisoformat(data['published_at'])
            except ValueError:
                published_at = datetime.utcnow()
        else:
            published_at = datetime.utcnow()
    article = Article(
        title=data['title'],
        summary=data.get('summary'),
        body=data.get('body'),
        thumbnail=data.get('thumbnail'),
        category=data.get('category'),
        author=data.get('author', 'Sanfreight Team'),
        is_published=is_published,
        published_at=published_at,
    )
    db.session.add(article)
    db.session.commit()
    return jsonify(article.to_dict(full=True)), 201


@articles_bp.route('/admin/articles/<article_id>', methods=['PUT'])
@token_required
def admin_update_article(current_user, article_id):
    article = Article.query.get_or_404(article_id)
    data = request.get_json()

    for field in ['title', 'summary', 'body', 'thumbnail', 'category', 'author']:
        if field in data:
            setattr(article, field, data[field])

    if 'is_published' in data:
        newly_published = data['is_published'] and not article.is_published
        article.is_published = data['is_published']
        if newly_published:
            article.published_at = datetime.utcnow()
        elif not data['is_published']:
            article.published_at = None

    db.session.commit()
    return jsonify(article.to_dict(full=True))


@articles_bp.route('/admin/articles/<article_id>', methods=['DELETE'])
@token_required
def admin_delete_article(current_user, article_id):
    article = Article.query.get_or_404(article_id)
    db.session.delete(article)
    db.session.commit()
    return jsonify({'message': 'Article deleted'})
