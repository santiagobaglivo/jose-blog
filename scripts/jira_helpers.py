"""Helpers para crear issues en Jira via REST API v3 con ADF (stdlib only)."""
import os
import json
import time
import urllib.request
import urllib.error
from base64 import b64encode

BASE = os.environ["JIRA_BASE_URL"]
EMAIL = os.environ["JIRA_EMAIL"]
TOKEN = os.environ["JIRA_API_TOKEN"]
PROJECT_KEY = os.environ.get("JIRA_DEFAULT_PROJECT", "JB")

_auth = b64encode(f"{EMAIL}:{TOKEN}".encode()).decode()
HEADERS = {
    "Authorization": f"Basic {_auth}",
    "Accept": "application/json",
    "Content-Type": "application/json",
}


def _post(url, payload, timeout=30):
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, method="POST")
    for k, v in HEADERS.items():
        req.add_header(k, v)
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8") or "{}")
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, body
    except urllib.error.URLError as e:
        return 0, str(e)


def text_node(t):
    return {"type": "text", "text": t}


def text_strong(t):
    return {"type": "text", "text": t, "marks": [{"type": "strong"}]}


def paragraph(text):
    if isinstance(text, list):
        return {"type": "paragraph", "content": text}
    return {"type": "paragraph", "content": [text_node(text)]}


def heading(text, level=3):
    return {
        "type": "heading",
        "attrs": {"level": level},
        "content": [text_node(text)],
    }


def code_block(code, lang="text"):
    return {
        "type": "codeBlock",
        "attrs": {"language": lang},
        "content": [text_node(code)],
    }


def bullets(items):
    return {
        "type": "bulletList",
        "content": [
            {
                "type": "listItem",
                "content": [paragraph(item)],
            }
            for item in items
        ],
    }


def adf(blocks):
    return {"version": 1, "type": "doc", "content": blocks}


def build_description(
    *,
    descripcion,
    contexto,
    objetivo,
    alcance,
    pasos,
    archivos,
    dependencias,
    criterios,
    qa,
    prioridad,
    estimacion,
    sprint,
    prompt_claude,
):
    blocks = [
        heading("Descripción", 3),
        paragraph(descripcion),
    ]
    if contexto:
        blocks += [heading("Contexto", 3), paragraph(contexto)]
    if objetivo:
        blocks += [heading("Objetivo", 3), paragraph(objetivo)]
    if alcance:
        blocks += [heading("Alcance", 3)]
        if isinstance(alcance, list):
            blocks.append(bullets(alcance))
        else:
            blocks.append(paragraph(alcance))
    if pasos:
        blocks += [heading("Pasos técnicos sugeridos", 3), bullets(pasos)]
    if archivos:
        blocks += [
            heading("Archivos / carpetas involucradas", 3),
            bullets(archivos),
        ]
    if dependencias:
        blocks += [
            heading("Dependencias", 3),
            paragraph(dependencias) if isinstance(dependencias, str) else bullets(dependencias),
        ]
    if criterios:
        blocks += [heading("Criterios de aceptación", 3), bullets(criterios)]
    if qa:
        blocks += [heading("Checklist QA", 3), bullets(qa)]

    meta_lines = []
    if prioridad:
        meta_lines.append(f"Prioridad: {prioridad}")
    if estimacion:
        meta_lines.append(f"Estimación: {estimacion}")
    if sprint:
        meta_lines.append(f"Sprint sugerido: {sprint}")
    if meta_lines:
        blocks += [heading("Metadata", 3)]
        blocks += [paragraph(line) for line in meta_lines]

    if prompt_claude:
        blocks += [
            heading("Prompt sugerido para Claude Code", 3),
            code_block(prompt_claude, "markdown"),
        ]
    return adf(blocks)


def create_issue(payload, retries=2, sleep=0.4):
    url = f"{BASE}/rest/api/3/issue"
    last_err = None
    for attempt in range(retries + 1):
        status, body = _post(url, payload)
        if status == 201:
            return body
        last_err = (status, body)
        if status in (429, 500, 502, 503, 504, 0):
            time.sleep(sleep * (attempt + 1) * 2)
            continue
        break
    return {"_error": True, "status": last_err[0], "body": last_err[1]}


PRIORITY_MAP = {
    "Highest": {"name": "Highest"},
    "High": {"name": "High"},
    "Medium": {"name": "Medium"},
    "Low": {"name": "Low"},
}
