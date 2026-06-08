"""Convert MP Board marksheet Excel to JSON for results.html lookup."""
import json
import re
from pathlib import Path

import openpyxl

ROOT = Path(__file__).resolve().parents[1]
EXCEL = ROOT / "2026 Jun-mp_board_10th_12th_marksheet_ocr_fields (1).xlsx"
OUT = ROOT / "resources" / "data" / "results-2026-jun.json"


def normalize_dob(value):
    if value is None:
        return ""
    text = str(value).strip()
    if re.fullmatch(r"\d{4}-\d{2}-\d{2}", text):
        return text
    match = re.fullmatch(r"(\d{1,2})\.(\d{1,2})\.(\d{4})", text)
    if match:
        day, month, year = match.groups()
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return text


def normalize_roll(value):
    if value is None:
        return ""
    return str(value).strip()


def row_to_record(headers, row):
    data = dict(zip(headers, row))
    subjects = []
    for i in range(1, 7):
        name = data.get(f"Subject {i} Name")
        if not name:
            continue
        theory = data.get(f"Subject {i} Theory Marks")
        practical = data.get(f"Subject {i} Practical/Internal Marks")
        total = data.get(f"Subject {i} Total Marks")
        subjects.append(
            {
                "name": str(name).strip(),
                "theory": theory,
                "practical": practical,
                "total": total,
            }
        )

    return {
        "rollNumber": normalize_roll(data.get("Roll Number")),
        "dateOfBirth": normalize_dob(data.get("Date of Birth")),
        "class": data.get("Class"),
        "enrollmentNumber": data.get("Enrollment Number"),
        "studentName": data.get("Student Name"),
        "fatherName": data.get("Father's Name"),
        "motherName": data.get("Mother's Name"),
        "schoolName": data.get("School Name"),
        "schoolCode": data.get("School Code"),
        "examinationYear": data.get("Examination Year"),
        "subjects": subjects,
        "totalObtained": data.get("Total Marks Obtained"),
        "maximumMarks": data.get("Maximum Marks"),
        "percentage": data.get("Percentage"),
        "division": data.get("Division/Grade"),
        "resultStatus": data.get("Result Status"),
        "serialNumber": data.get("Marksheet Serial Number"),
        "issueDate": data.get("Issue Date"),
    }


def main():
    wb = openpyxl.load_workbook(EXCEL, read_only=True, data_only=True)
    ws = wb["MP Marksheet OCR Fields"]
    rows = list(ws.iter_rows(min_row=2, values_only=True))
    headers = rows[0]
    records = [row_to_record(headers, row) for row in rows[1:] if row[2] is not None]

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} records to {OUT}")


if __name__ == "__main__":
    main()
