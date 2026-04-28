"""Crea épicas y tareas en Jira proyecto JB.

Uso:
    JIRA_BASE_URL=... JIRA_EMAIL=... JIRA_API_TOKEN=... JIRA_DEFAULT_PROJECT=JB \
    python3 scripts/jira_create.py
"""
import sys
import json
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from jira_helpers import (
    PROJECT_KEY,
    PRIORITY_MAP,
    adf,
    paragraph,
    heading,
    code_block,
    create_issue,
    build_description,
)
from jira_data import EPICS, ALL_TASKS


REPORT_FILE = Path(__file__).parent / "jira_report.json"


def epic_payload(e):
    desc = adf([
        heading("Resumen", 3),
        paragraph(e["description"]),
        heading("Documentación", 3),
        paragraph("Ver docs/00-INDEX.md para plan completo y docs/07-BACKLOG-JIRA.md para detalle de cada tarea."),
    ])
    payload = {
        "fields": {
            "project": {"key": PROJECT_KEY},
            "summary": f"[EPIC] {e['summary']}",
            "issuetype": {"name": "Epic"},
            "description": desc,
            "priority": PRIORITY_MAP.get(e["priority"], PRIORITY_MAP["Medium"]),
            "labels": [f"epic-{e['key'].lower()}"],
        }
    }
    return payload


def task_payload(t, epic_jira_key):
    desc = build_description(
        descripcion=t["descripcion"],
        contexto=t["contexto"],
        objetivo=t["objetivo"],
        alcance=t["alcance"],
        pasos=t["pasos"],
        archivos=t["archivos"],
        dependencias=t["dependencias"],
        criterios=t["criterios"],
        qa=t["qa"],
        prioridad=t["priority"],
        estimacion=str(t["estimacion"]) if t["estimacion"] else "",
        sprint=t["sprint"],
        prompt_claude=t["prompt"],
    )
    sprint_label = t["sprint"].lower().replace(" ", "-")
    payload = {
        "fields": {
            "project": {"key": PROJECT_KEY},
            "summary": t["summary"],
            "issuetype": {"name": t["type"]},
            "parent": {"key": epic_jira_key},
            "description": desc,
            "priority": PRIORITY_MAP.get(t["priority"], PRIORITY_MAP["Medium"]),
            "labels": [
                sprint_label,
                f"epic-{t['epic_key'].lower()}",
            ],
        }
    }
    return payload


def main():
    report = {"epics": {}, "tasks": [], "errors": []}

    print("=" * 60)
    print("Creando épicas en Jira proyecto", PROJECT_KEY)
    print("=" * 60)

    epic_keys = {}  # local key -> jira key

    for e in EPICS:
        print(f"  • {e['key']}: {e['summary']} ... ", end="", flush=True)
        result = create_issue(epic_payload(e))
        if result.get("_error"):
            print(f"ERROR ({result['status']})")
            print(f"    {result.get('body', '')[:200]}")
            report["errors"].append({"epic": e["key"], "error": result})
            continue
        jira_key = result["key"]
        epic_keys[e["key"]] = jira_key
        report["epics"][e["key"]] = {"jira_key": jira_key, "summary": e["summary"]}
        print(f"OK → {jira_key}")
        time.sleep(0.3)

    if not epic_keys:
        print("FATAL: ninguna épica creada. Abortando.")
        REPORT_FILE.write_text(json.dumps(report, indent=2))
        sys.exit(1)

    # Save epic keys early in case tasks fail
    REPORT_FILE.write_text(json.dumps(report, indent=2))

    print()
    print("=" * 60)
    print(f"Creando {len(ALL_TASKS)} tareas linkeadas a épicas")
    print("=" * 60)

    success = 0
    failed = 0
    for i, t in enumerate(ALL_TASKS, 1):
        epic_jira = epic_keys.get(t["epic_key"])
        if not epic_jira:
            print(f"  [{i:3d}/{len(ALL_TASKS)}] SKIP {t['summary'][:60]} (epic {t['epic_key']} no creada)")
            failed += 1
            continue

        prefix = f"[{i:3d}/{len(ALL_TASKS)}]"
        title = t["summary"][:70]
        print(f"  {prefix} {title} ... ", end="", flush=True)

        result = create_issue(task_payload(t, epic_jira))
        if result.get("_error"):
            print(f"ERR ({result['status']})")
            report["errors"].append({"task": t["summary"], "error": result})
            failed += 1
            time.sleep(0.5)
            continue

        jira_key = result["key"]
        report["tasks"].append({
            "jira_key": jira_key,
            "summary": t["summary"],
            "epic": t["epic_key"],
            "epic_jira": epic_jira,
            "sprint": t["sprint"],
            "type": t["type"],
            "priority": t["priority"],
        })
        print(f"OK → {jira_key}")
        success += 1
        # Save report after each batch of 10
        if i % 10 == 0:
            REPORT_FILE.write_text(json.dumps(report, indent=2))
        time.sleep(0.25)

    REPORT_FILE.write_text(json.dumps(report, indent=2))

    print()
    print("=" * 60)
    print("RESUMEN")
    print("=" * 60)
    print(f"  Épicas creadas:  {len(epic_keys)}/{len(EPICS)}")
    print(f"  Tareas creadas:  {success}/{len(ALL_TASKS)}")
    print(f"  Errores:         {failed}")
    print(f"  Reporte:         {REPORT_FILE}")
    print()

    if report["errors"]:
        print("Errores detectados:")
        for err in report["errors"][:5]:
            print(f"  - {json.dumps(err)[:200]}")


if __name__ == "__main__":
    main()
