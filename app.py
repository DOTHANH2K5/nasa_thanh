import datetime
import html
import json
import math
import os
import time
from io import BytesIO
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

import requests
from flask import Flask, jsonify, render_template, request, send_file
from PIL import Image as PILImage
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Image as PDFImage,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)


app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 64 * 1024

NASA_APOD_URL = "https://api.nasa.gov/planetary/apod"
NASA_IMAGES_URL = "https://images-api.nasa.gov/search"
API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")
WEEK_DAYS = 7
CACHE_SECONDS = 60 * 60
REFRESH_COOLDOWN = 5 * 60
JAPAN_TIME = ZoneInfo("Asia/Tokyo")
_cache = {}


def read_cache(cache_key, force_refresh):
    cached = _cache.get(cache_key)
    if not cached:
        return None

    age = time.monotonic() - cached["saved_at"]

    if force_refresh and age < REFRESH_COOLDOWN:
        wait_seconds = math.ceil(REFRESH_COOLDOWN - age)
        return cached["entries"], cached["fetched_at"], True, wait_seconds

    if not force_refresh and age < CACHE_SECONDS:
        return cached["entries"], cached["fetched_at"], True, 0

    return None


def save_cache(cache_key, entries):
    fetched_at = datetime.datetime.now(JAPAN_TIME)
    _cache[cache_key] = {
        "saved_at": time.monotonic(),
        "fetched_at": fetched_at,
        "entries": entries,
    }
    return entries, fetched_at, False, 0


def get_apod_entries(days_back, force_refresh=False):
    """Get a date range of NASA APOD entries with one API request."""
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=days_back - 1)
    cache_key = f"{start_date}:{end_date}"

    cached_result = read_cache(cache_key, force_refresh)
    if cached_result:
        return cached_result

    params = {
        "api_key": API_KEY,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "thumbs": "True",
    }

    response = requests.get(NASA_APOD_URL, params=params, timeout=30)
    response.raise_for_status()
    entries = response.json()

    if isinstance(entries, dict):
        entries = [entries]

    entries = sorted(
        entries,
        key=lambda entry: entry.get("date", ""),
        reverse=True,
    )
    return save_cache(cache_key, entries)


def get_entries(view_mode, force_refresh=False):
    if view_mode == "moon":
        return get_moon_images(force_refresh)

    return get_apod_entries(WEEK_DAYS, force_refresh)


def get_moon_images(force_refresh=False):
    """Search NASA's Image Library directly for moon images."""
    cached_result = read_cache("moon", force_refresh)
    if cached_result:
        return cached_result

    response = requests.get(
        NASA_IMAGES_URL,
        params={"q": "moon", "media_type": "image", "page_size": 12},
        timeout=30,
    )
    response.raise_for_status()

    items = response.json().get("collection", {}).get("items", [])
    entries = []

    for item in items[:12]:
        data = (item.get("data") or [{}])[0]
        image_link = next(
            (
                link.get("href")
                for link in item.get("links", [])
                if link.get("render") == "image"
            ),
            None,
        )

        if not image_link:
            continue

        nasa_id = data.get("nasa_id", "")
        entries.append(
            {
                "date": data.get("date_created", "")[:10],
                "title": data.get("title", "Moon Image"),
                "explanation": data.get("description", ""),
                "media_type": "image",
                "url": image_link,
                "hdurl": f"https://images.nasa.gov/details/{nasa_id}",
                "copyright": data.get("photographer") or data.get("center") or "NASA",
            }
        )

    return save_cache("moon", entries)


def is_allowed_nasa_image(url):
    """Only allow HTTPS image downloads from NASA-owned domains."""
    parsed = urlparse(url or "")
    hostname = (parsed.hostname or "").lower()
    return parsed.scheme == "https" and (
        hostname == "nasa.gov" or hostname.endswith(".nasa.gov")
    )


def clean_pdf_text(value):
    """Keep PDF text compatible with ReportLab's built-in font."""
    text = str(value or "").encode("latin-1", "replace").decode("latin-1")
    return html.escape(text)


def download_pdf_image(url):
    """Download and resize one NASA image for the PDF."""
    if not is_allowed_nasa_image(url):
        return None

    response = requests.get(url, timeout=30)
    response.raise_for_status()

    if len(response.content) > 8 * 1024 * 1024:
        return None

    with PILImage.open(BytesIO(response.content)) as original:
        image = original.convert("RGB")
        image.thumbnail((1600, 1200))
        width, height = image.size
        image_buffer = BytesIO()
        image.save(image_buffer, format="JPEG", quality=85)
        image_buffer.seek(0)

    max_width = 170 * mm
    max_height = 150 * mm
    scale = min(max_width / width, max_height / height)
    return PDFImage(
        image_buffer,
        width=width * scale,
        height=height * scale,
    )


def build_album_pdf(entries):
    """Build a PDF album in memory from selected favorite entries."""
    output = BytesIO()
    document = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        title="My NASA Album",
    )

    styles = getSampleStyleSheet()
    cover_style = ParagraphStyle(
        "AlbumCover",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=30,
        leading=36,
        alignment=TA_CENTER,
        spaceAfter=12,
    )
    subtitle_style = ParagraphStyle(
        "AlbumSubtitle",
        parent=styles["Normal"],
        fontSize=12,
        textColor="#52617a",
        alignment=TA_CENTER,
        leading=18,
    )
    image_title_style = ParagraphStyle(
        "ImageTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        spaceAfter=8,
    )
    meta_style = ParagraphStyle(
        "Meta",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor="#52617a",
    )
    body_style = ParagraphStyle(
        "AlbumBody",
        parent=styles["BodyText"],
        fontSize=9,
        leading=14,
        spaceBefore=10,
    )

    story = [
        Spacer(1, 65 * mm),
        Paragraph("MY NASA ALBUM", cover_style),
        Paragraph(
            "A personal collection from NASA SPACE VIEWER",
            subtitle_style,
        ),
        Spacer(1, 12 * mm),
        Paragraph(
            f"{len(entries)} FAVORITE IMAGES | {datetime.date.today().isoformat()}",
            subtitle_style,
        ),
        PageBreak(),
    ]

    for index, entry in enumerate(entries):
        image_url = entry.get("url") if entry.get("media_type") == "image" else None

        if image_url:
            try:
                pdf_image = download_pdf_image(image_url)
                if pdf_image:
                    pdf_image.hAlign = "CENTER"
                    story.extend([pdf_image, Spacer(1, 8 * mm)])
            except (requests.exceptions.RequestException, OSError):
                pass

        story.append(
            Paragraph(clean_pdf_text(entry.get("title", "NASA Image")), image_title_style)
        )
        story.append(
            Paragraph(
                f"DATE: {clean_pdf_text(entry.get('date', 'Unknown'))}",
                meta_style,
            )
        )

        copyright_name = entry.get("copyright")
        if copyright_name:
            story.append(
                Paragraph(
                    f"IMAGE CREDIT: {clean_pdf_text(copyright_name)}",
                    meta_style,
                )
            )

        source_url = entry.get("hdurl") or entry.get("url")
        if source_url:
            safe_url = html.escape(str(source_url), quote=True)
            story.append(
                Paragraph(
                    f'SOURCE: <a href="{safe_url}" color="#315f9a">NASA</a>',
                    meta_style,
                )
            )

        description = str(entry.get("explanation", ""))[:700]
        if description:
            story.append(Paragraph(clean_pdf_text(description), body_style))

        if index < len(entries) - 1:
            story.append(PageBreak())

    document.build(story)
    output.seek(0)
    return output


@app.post("/download/pdf")
def download_album_pdf():
    payload = request.get_json(silent=True) or {}
    entries = payload.get("entries", [])

    if not isinstance(entries, list) or not entries:
        return jsonify({"error": "お気に入り画像がありません。"}), 400

    entries = [entry for entry in entries[:20] if isinstance(entry, dict)]
    if not entries:
        return jsonify({"error": "PDFにできる画像がありません。"}), 400

    pdf = build_album_pdf(entries)
    return send_file(
        pdf,
        mimetype="application/pdf",
        as_attachment=True,
        download_name="my-nasa-album.pdf",
    )


@app.route("/")
def index():
    entries = []
    error_message = None
    fetched_at = None
    from_cache = False
    refresh_message = None
    json_preview = None
    view_mode = request.args.get("view")
    force_refresh = request.args.get("refresh") == "1"

    if view_mode not in {None, "week", "moon", "favorites"}:
        view_mode = None

    if view_mode in {"week", "moon"}:
        try:
            entries, fetched_at, from_cache, wait_seconds = get_entries(
                view_mode,
                force_refresh,
            )

            if force_refresh and wait_seconds:
                wait_minutes = math.ceil(wait_seconds / 60)
                refresh_message = f"次の更新まで約{wait_minutes}分お待ちください。"
            elif force_refresh:
                refresh_message = "NASAから最新データを取得しました。"

            preview_items = [
                {
                    "date": entry.get("date"),
                    "title": entry.get("title"),
                    "media_type": entry.get("media_type"),
                    "url": entry.get("url"),
                }
                for entry in entries[:3]
            ]
            json_preview = json.dumps(
                preview_items,
                ensure_ascii=False,
                indent=2,
            )
        except requests.exceptions.HTTPError as error:
            if error.response is not None and error.response.status_code == 429:
                error_message = (
                    "NASA APIの利用上限に達しました。少し時間を置いて再度お試しください。"
                )
            else:
                error_message = "NASAのデータを取得できませんでした。"
        except requests.exceptions.RequestException:
            error_message = "NASAとの通信に失敗しました。"

    return render_template(
        "index.html",
        entries=entries,
        error_message=error_message,
        view_mode=view_mode,
        fetched_at=fetched_at,
        from_cache=from_cache,
        refresh_message=refresh_message,
        json_preview=json_preview,
    )


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    app.run(host="0.0.0.0", port=port, debug=True)
