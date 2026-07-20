"""
One-time migration: pulls the news articles and job postings that used to
live only as static scraped page.json files (under src/content/pages) into
the admin backend's database, via its own HTTP API.

Run once against a fresh backend (e.g. right after first deploy) so the
admin panel starts pre-populated with Sanfreight's real content instead of
an empty database. Safe to re-run, but re-running will create duplicate
articles/jobs with "-1", "-2", ... slugs rather than updating existing ones
— check the admin panel first if you're not sure whether this has already
run against a given database.

Usage (from the repo root, with the backend running):
    python3 scripts/migrate_legacy_content.py [--api http://localhost:5000] \
        --email admin@sanfreight.com --password Admin@123
"""

import argparse
import html
import json
import re
import sys
import urllib.error
import urllib.request

ARTICLE_PATHS = [
    "src/content/pages/en/2026/06/09/logistics-control-towers-smart-networks-global-trade/page.json",
    "src/content/pages/en/2026/06/16/green-shipping-environmental-laws-indian-exports/page.json",
    "src/content/pages/en/2026/06/23/indian-msmes-cross-border-ecommerce-logistics/page.json",
    "src/content/pages/en/2026/06/30/india-uk-ceta-changes-international-shipping/page.json",
]

JOB_PATHS = [
    "src/content/pages/en/job-offers/administrative-sales-support/page.json",
    "src/content/pages/en/job-offers/project-manager-real-estate-europe/page.json",
]


def api_post(api_base, token, path, payload):
    req = urllib.request.Request(
        f"{api_base}{path}",
        data=json.dumps(payload).encode("utf-8"),
        method="POST",
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}",
        },
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())


def login(api_base, email, password):
    req = urllib.request.Request(
        f"{api_base}/api/auth/login",
        data=json.dumps({"email": email, "password": password}).encode("utf-8"),
        method="POST",
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read())["token"]


def extract_article(path):
    data = json.loads(open(path, encoding="utf-8").read())
    body_html = data["bodyHtml"]

    date_parts = path.split("/")[4:7]  # .../en/YYYY/MM/DD/slug/page.json
    published_date = "-".join(date_parts)

    title = re.sub(r"\s*-\s*Sanfreight\s*$", "", data["title"]).strip()
    cat_m = re.search(r"<span>Category</span><br />\s*(.*?)\s*</div>", body_html, re.DOTALL)
    img_m = re.search(r'srcset="([^"]+)" media', body_html)
    blocks = re.findall(
        r'<div class="partial-wysiwyg">(.*?)</div>\n<div class="bloc-separator">',
        body_html,
        re.DOTALL,
    )

    category = cat_m.group(1).replace("&amp;", "&").strip() if cat_m else None
    thumbnail = img_m.group(1) if img_m else None
    body = "\n".join(f'<div class="partial-wysiwyg">{b}</div>' for b in blocks)
    first_p = re.search(r"<p>(.*?)</p>", blocks[0] if blocks else "", re.DOTALL)
    summary = re.sub(r"<[^>]+>", "", first_p.group(1)).strip()[:280] if first_p else ""

    return {
        "title": title,
        "category": category,
        "thumbnail": thumbnail,
        "summary": summary,
        "body": body,
        "author": "Sanfreight Team",
        "is_published": True,
        "published_at": f"{published_date}T00:00:00",
    }


def extract_job(path):
    data = json.loads(open(path, encoding="utf-8").read())
    body = data["bodyHtml"]

    title = html.unescape(re.sub(r"\s*-\s*Sanfreight\s*$", "", data["title"]).strip())

    desc_m = re.search(
        r'<div class="description" data-animation="reveal-lines">\s*(.*?)\s*</div>',
        body,
        re.DOTALL,
    )
    description = html.unescape(re.sub(r"<[^>]+>", "", desc_m.group(1)).strip()) if desc_m else ""

    bullets = re.findall(r'<div class="options-texts">\s*(.*?)\s*</div>', body, re.DOTALL)
    requirements = "\n".join(
        f"- {html.unescape(re.sub(r'<[^>]+>', '', b).strip())}" for b in bullets
    )

    return {
        "title": title,
        "description": description,
        "requirements": requirements,
        "location": "India",
        "department": "Operations",
        "type": "full-time",
        "is_active": True,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--api", default="http://localhost:5000")
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    try:
        token = login(args.api, args.email, args.password)
    except urllib.error.URLError as e:
        print(f"Could not log in to {args.api}: {e}", file=sys.stderr)
        sys.exit(1)

    for path in ARTICLE_PATHS:
        article = extract_article(path)
        try:
            res = api_post(args.api, token, "/api/admin/articles", article)
            print(f"article: {res.get('slug', res)}")
        except urllib.error.HTTPError as e:
            print(f"article failed ({path}): {e.read().decode()}", file=sys.stderr)

    for path in JOB_PATHS:
        job = extract_job(path)
        try:
            res = api_post(args.api, token, "/api/admin/jobs", job)
            print(f"job: {res.get('slug', res)}")
        except urllib.error.HTTPError as e:
            print(f"job failed ({path}): {e.read().decode()}", file=sys.stderr)


if __name__ == "__main__":
    main()
