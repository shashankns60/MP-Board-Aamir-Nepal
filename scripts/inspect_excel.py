import openpyxl

wb = openpyxl.load_workbook(
    r"c:\Users\sunny\Downloads\mp\MP\mpbse.org\2026 Jun-mp_board_10th_12th_marksheet_ocr_fields (1).xlsx",
    read_only=True,
)
ws = wb["MP Marksheet OCR Fields"]
rows = list(ws.iter_rows(min_row=2, values_only=True))
headers = rows[0]
for r in rows[1:6]:
    d = dict(zip(headers, r))
    print("---", d["Student Name"], "---")
    for i in range(1, 7):
        name = d.get(f"Subject {i} Name")
        if not name:
            continue
        print(
            f"  S{i}: {name} theory={d.get(f'Subject {i} Theory Marks')} "
            f"prac={d.get(f'Subject {i} Practical/Internal Marks')} "
            f"total={d.get(f'Subject {i} Total Marks')} "
            f"obt={d.get(f'Subject {i} Obtained Marks')}"
        )
    print("  Grand:", d["Total Marks Obtained"], "/", d["Maximum Marks"])
