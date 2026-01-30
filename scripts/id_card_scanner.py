"""
Hostel ID Card Scanner
- Scans QR/Barcode from an ID card
- Runs OCR on the card to extract key fields

Requirements (see requirements-id-card.txt):
  pip install -r scripts/requirements-id-card.txt

Optional: Install Tesseract OCR engine and add it to PATH.
Windows download: https://github.com/UB-Mannheim/tesseract/wiki
"""

import json
import os
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path

import cv2
from pyzbar import pyzbar
import pytesseract

TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
]

env_tesseract = os.environ.get("TESSERACT_PATH")
if env_tesseract:
    pytesseract.pytesseract.tesseract_cmd = env_tesseract
else:
    for candidate in TESSERACT_PATHS:
        if Path(candidate).exists():
            pytesseract.pytesseract.tesseract_cmd = candidate
            break


@dataclass
class ScanResult:
    raw_text: str
    qr_data: str | None
    name: str | None
    hostel_id: str | None
    hostel: str | None
    college: str | None
    block: str | None
    floor: str | None
    room: str | None
    dob: str | None
    phone: str | None
    doc_type: str | None


def normalize_text(text: str) -> str:
    cleaned = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        cleaned.append(line)
    return "\n".join(cleaned)


def classify_document(text: str) -> str:
    text_lower = text.lower()
    aadhaar_keywords = ["aadhaar", "uidai", "government of india", "unique identification", "vid"]
    pan_keywords = ["income tax", "permanent account number", "pan", "govt of india"]
    college_keywords = ["college", "university", "institute", "student", "campus", "department", "branch", "semester", "reg no", "registration", "usn", "student id"]

    if any(word in text_lower for word in aadhaar_keywords):
        return "aadhaar"
    if any(word in text_lower for word in pan_keywords):
        return "pan"
    if any(word in text_lower for word in college_keywords):
        return "college_id"
    return "other"


def parse_fields(text: str) -> dict:
    text_clean = normalize_text(text)
    lines = text_clean.split("\n")
    name = None
    hostel_id = None
    hostel = None
    college = None
    block = None
    floor = None
    room = None
    dob = None
    phone = None

    def clean_trailing_labels(value: str) -> str:
        cleaned = re.sub(
            r"\b(Reg\s*No\.?|Reg\s*No|Registration\s*No|Regn\.?\s*No|Enrollment\s*No|USN|Roll\s*No|Student\s*ID|Branch|DOB|D\.O\.B\.|Date of Birth)\b.*$",
            "",
            value,
            flags=re.IGNORECASE,
        )
        return cleaned.strip(" -:")

    def infer_college_from_header() -> str | None:
        header_lines = lines[:6]
        if not header_lines:
            return None

        address_terms = {
            "layout",
            "road",
            "rd",
            "street",
            "st",
            "nagar",
            "colony",
            "district",
            "state",
            "pin",
            "pincode",
            "bangalore",
            "bengaluru",
            "karnataka",
            "india",
            "po",
        }
        stop_terms = {
            "name",
            "reg",
            "registration",
            "student",
            "id",
            "branch",
            "dob",
            "d.o.b",
            "date of birth",
            "acd",
            "academic",
            "year",
            "hostel",
            "room",
            "block",
            "floor",
        }

        def score_line(line: str) -> int:
            lowered = line.lower()
            score = 0
            if any(term in lowered for term in ("college", "university", "institute", "school", "campus")):
                score += 6
            if any(term in lowered for term in address_terms):
                score -= 5
            if any(term in lowered for term in stop_terms):
                score -= 4
            digits = sum(ch.isdigit() for ch in line)
            if digits >= 4:
                score -= 3
            letters = sum(ch.isalpha() for ch in line)
            if letters >= 8 and digits == 0:
                score += 2
            if re.fullmatch(r"[A-Z][A-Z .,'&-]{6,}", line):
                score += 2
            if len(line) < 6:
                score -= 2
            return score

        best_line = None
        best_score = -999
        for line in header_lines:
            score = score_line(line)
            if score > best_score:
                best_score = score
                best_line = line

        if best_line and best_score >= 2:
            return best_line.strip(" -:")
        return None

    def find_after_label(
        label_pattern: str,
        value_pattern: str,
        skip_terms: set[str] | None = None,
        validator=None,
    ) -> str | None:
        pattern = re.compile(label_pattern, re.IGNORECASE)
        value_re = re.compile(value_pattern, re.IGNORECASE)
        skip_terms = skip_terms or set()

        for idx, line in enumerate(lines):
            if pattern.search(line):
                inline = value_re.search(line)
                if inline:
                    value = inline.group(1).strip()
                    if value.upper() in skip_terms:
                        continue
                    if validator and not validator(value):
                        continue
                    return value
                if idx + 1 < len(lines):
                    next_line = lines[idx + 1].strip()
                    inline_next = value_re.search(next_line)
                    if inline_next:
                        value = inline_next.group(1).strip()
                        if value.upper() in skip_terms:
                            continue
                        if validator and not validator(value):
                            continue
                        return value
        return None

    name = find_after_label(
        r"\b(Name|Student Name)\b",
        r"(?:Name|Student Name)[:\s-]*([A-Z][A-Za-z .'-]{2,}?)(?=\s*(?:Reg\s*No|Regn|Registration|Student\s*ID|USN|Roll\s*No|Branch|DOB|D\.O\.B\.|Date of Birth|$))",
    )
    if not name:
        name = find_after_label(r"\bName\b", r"^([A-Z][A-Za-z .'-]{2,}?)(?=\s*(?:Reg\s*No|Regn|Registration|Student\s*ID|USN|Roll\s*No|Branch|DOB|D\.O\.B\.|Date of Birth|$))")
    if name:
        name = clean_trailing_labels(name)
        if len(name) < 3:
            name = None

    hostel_id = find_after_label(
        r"\b(Reg\s*No\.?|Reg\s*No|Registration\s*No|Regn\.?\s*No|Enrollment\s*No|USN|Roll\s*No|Student\s*ID)\b",
        r"(?:Reg\s*No\.?|Reg\s*No|Registration\s*No|Regn\.?\s*No|Enrollment\s*No|USN|Roll\s*No|Student\s*ID)[:\s-]*([A-Z0-9-]{4,})",
        skip_terms={"CARD", "STUDENT", "ID", "BRANCH"},
        validator=lambda value: bool(re.search(r"\d", value)),
    )
    if not hostel_id:
        hostel_id = find_after_label(
            r"\b(Reg\s*No\.?|Registration|Regn\.?|Enrollment|USN|Roll\s*No)\b",
            r"^([A-Z0-9-]{4,})$",
            skip_terms={"CARD", "STUDENT", "ID", "BRANCH"},
            validator=lambda value: bool(re.search(r"\d", value)),
        )
    if hostel_id and not re.search(r"\d", hostel_id):
        hostel_id = None

    college_header = None
    for line in lines:
        if line.lower().startswith("college_header:"):
            college_header = line.split(":", 1)[1].strip()
            break

    def sanitize_college(value: str | None) -> str | None:
        if not value:
            return None
        cleaned = re.sub(r"[^A-Za-z&.,'\s-]", " ", value)
        cleaned = re.sub(r"\s{2,}", " ", cleaned).strip(" -:")
        if len(cleaned) < 6:
            return None
        lowered = cleaned.lower()
        keywords = [
            "college",
            "university",
            "institute",
            "institutions",
            "engineering",
            "school",
            "campus",
        ]
        word_count = len(cleaned.split())
        if not any(keyword in lowered for keyword in keywords):
            if word_count < 2 or len(cleaned) < 12:
                return None
        return cleaned

    college_match = re.search(r"(?:College|University|Institute|Campus)[:\s-]*([A-Za-z0-9 .,'-]{4,})", text_clean, re.IGNORECASE)
    if college_match:
        college = sanitize_college(college_match.group(1).strip())
    if not college and college_header:
        college = sanitize_college(college_header)
    if not college:
        for line in lines:
            if re.search(r"\b(College|University|Institute)\b", line, re.IGNORECASE):
                college = sanitize_college(line.strip())
                break
    if not college:
        college = sanitize_college(infer_college_from_header())

    dob = find_after_label(
        r"\b(DOB|D\.O\.B\.|Date of Birth)\b",
        r"(?:DOB|D\.O\.B\.|Date of Birth)[^0-9A-Za-z]{0,6}([0-3]?\d[\-/\s][01]?\d[\-/\s](?:19|20)?\d\d)",
    )
    if not dob:
        dob = find_after_label(
            r"\b(DOB|D\.O\.B\.|Date of Birth)\b",
            r"(?:DOB|D\.O\.B\.|Date of Birth)[^0-9A-Za-z]{0,6}([0-3]?\d[\s\-/]*[A-Za-z]{3,9}[\s\-/]*(?:19|20)?\d\d)",
        )
        if dob:
            dob = re.sub(r"\s+", "-", dob)

    phone = find_after_label(
        r"\b(Phone|Mobile|Contact|Emergency\s*Phone)\b",
        r"(?:Phone|Mobile|Contact|Emergency\s*Phone)[:\s-]*([+]?\d[\d\s-]{7,})",
    )
    if not phone:
        phone_candidates = re.findall(r"\b\d{10}\b", text_clean)
        if phone_candidates:
            phone = phone_candidates[0]

    hostel_match = re.search(r"(?:Hostel|Residence|Hall)[:\s]*([A-Z0-9-]{1,})", text_clean, re.IGNORECASE)
    if hostel_match:
        hostel = hostel_match.group(1).strip()

    block_match = re.search(r"(?:Block)[:\s]*([A-Z0-9-]{1,})", text_clean, re.IGNORECASE)
    if block_match:
        block = block_match.group(1).strip()

    floor_match = re.search(r"(?:Floor)[:\s]*([A-Z0-9-]{1,})", text_clean, re.IGNORECASE)
    if floor_match:
        floor = floor_match.group(1).strip()

    room_match = re.search(r"(?:Room)[:\s]*([A-Z0-9-]{1,})", text_clean, re.IGNORECASE)
    if room_match:
        room = room_match.group(1).strip()

    if not hostel:
        hostel_inline = re.search(r"Hostel\s*([A-Z0-9-]{1,})", text_clean, re.IGNORECASE)
        if hostel_inline:
            hostel = hostel_inline.group(1).strip()

    if not room:
        room_inline = re.search(r"Room\s*([A-Z0-9-]{1,})", text_clean, re.IGNORECASE)
        if room_inline:
            room = room_inline.group(1).strip()

    if not hostel_id:
        id_candidates = re.findall(r"\b[A-Z]{0,3}\d{2}[A-Z]{1,4}\d{2,4}\b", text_clean)
        if id_candidates:
            hostel_id = id_candidates[0]

    if not hostel_id:
        generic_ids = re.findall(r"\b[A-Z0-9-]{6,}\b", text_clean)
        blacklist = {"STUDENT", "COLLEGE", "ENGINEERING", "CARD", "UNIVERSITY", "INSTITUTE"}
        for candidate in generic_ids:
            if candidate.upper() in blacklist:
                continue
            if any(char.isdigit() for char in candidate) and any(char.isalpha() for char in candidate):
                hostel_id = candidate
                break

    return {
        "name": name,
        "student_id": hostel_id,
        "college": college,
        "hostel": hostel,
        "block": block,
        "floor": floor,
        "room": room,
        "dob": dob,
        "phone": phone,
        "doc_type": classify_document(text_clean),
    }


def ocr_best(image: cv2.typing.MatLike) -> str:
    rotations = [
        (0, image),
        (90, cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE)),
        (180, cv2.rotate(image, cv2.ROTATE_180)),
        (270, cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE)),
    ]

    best_text = ""
    best_score = -1.0

    for _, rotated in rotations:
        gray = cv2.cvtColor(rotated, cv2.COLOR_BGR2GRAY)
        gray = cv2.bilateralFilter(gray, 9, 75, 75)
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

        data = pytesseract.image_to_data(thresh, output_type=pytesseract.Output.DICT)
        texts = [t for t in data.get("text", []) if t.strip()]
        confs = [float(c) for c in data.get("conf", []) if c != "-1"]
        score = (sum(confs) / len(confs)) if confs else 0.0

        base_text = pytesseract.image_to_string(thresh)
        psm6_text = pytesseract.image_to_string(thresh, config="--oem 1 --psm 6")
        psm11_text = pytesseract.image_to_string(thresh, config="--oem 1 --psm 11")
        text = " ".join(texts) + "\n" + base_text + "\n" + psm6_text + "\n" + psm11_text
        if score > best_score and len(text.strip()) > 20:
            best_score = score
            best_text = text

    return best_text


def extract_prominent_header(image: cv2.typing.MatLike) -> str | None:
    rotations = [
        image,
        cv2.rotate(image, cv2.ROTATE_90_CLOCKWISE),
        cv2.rotate(image, cv2.ROTATE_180),
        cv2.rotate(image, cv2.ROTATE_90_COUNTERCLOCKWISE),
    ]

    address_terms = {
        "layout",
        "road",
        "rd",
        "street",
        "st",
        "nagar",
        "colony",
        "district",
        "state",
        "pin",
        "pincode",
        "bangalore",
        "bengaluru",
        "karnataka",
        "india",
        "po",
        "phone",
    }
    keyword_terms = {"college", "university", "institute", "institutions", "engineering", "school", "campus"}

    best_text = None
    best_score = -1.0

    for rotated in rotations:
        height = rotated.shape[0]
        top_cut = int(height * 0.35)
        region = rotated[:top_cut, :]

        gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
        gray = cv2.bilateralFilter(gray, 9, 75, 75)
        thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

        for config in ("--oem 1 --psm 6", "--oem 1 --psm 11", "--oem 1 --psm 7"):
            data = pytesseract.image_to_data(thresh, output_type=pytesseract.Output.DICT, config=config)
            words = data.get("text", [])
            heights = data.get("height", [])
            tops = data.get("top", [])
            confs = data.get("conf", [])
            line_nums = data.get("line_num", [])
            block_nums = data.get("block_num", [])
            par_nums = data.get("par_num", [])

            lines_map: dict[tuple[int, int, int], list[tuple[str, int, int, float]]] = {}
            for idx, word in enumerate(words):
                text = word.strip()
                if not text:
                    continue
                conf = float(confs[idx]) if confs[idx] != "-1" else 0.0
                key = (block_nums[idx], par_nums[idx], line_nums[idx])
                lines_map.setdefault(key, []).append((text, heights[idx], tops[idx], conf))

            for _, items in lines_map.items():
                texts = [item[0] for item in items]
                line_text = " ".join(texts)
                avg_height = sum(item[1] for item in items) / len(items)
                avg_top = sum(item[2] for item in items) / len(items)
                avg_conf = sum(item[3] for item in items) / len(items)

                if avg_conf < 30:
                    continue
                if avg_top > top_cut * 0.9:
                    continue

                cleaned = re.sub(r"[^A-Za-z&.,'\s-]", " ", line_text)
                cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()
                if len(cleaned) < 6:
                    continue

                lowered = cleaned.lower()
                if any(term in lowered for term in address_terms):
                    continue

                letters = sum(ch.isalpha() for ch in cleaned)
                letters_ratio = letters / max(len(cleaned), 1)
                keywords = [term for term in keyword_terms if term in lowered]

                score = avg_height * 2
                score += letters_ratio * 10
                if avg_conf > 60:
                    score += 5
                if "college of" in lowered:
                    score += 30
                if keywords:
                    score += 20
                if sum(ch.isdigit() for ch in cleaned) >= 3:
                    score -= 10

                if score > best_score:
                    best_score = score
                    best_text = cleaned

    return best_text or None


def scan_camera(camera_index: int = 0) -> ScanResult:
    cap = cv2.VideoCapture(camera_index)
    if not cap.isOpened():
        raise RuntimeError("Unable to open camera")

    last_ocr = 0
    ocr_text = ""
    qr_data = None

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        barcodes = pyzbar.decode(frame)
        if barcodes:
            qr_data = barcodes[0].data.decode("utf-8", errors="ignore")

        now = time.time()
        if now - last_ocr > 1.5:
            last_ocr = now
            ocr_text = ocr_best(frame)

        overlay = frame.copy()
        cv2.putText(overlay, "Press Q to quit", (16, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 200, 255), 2)
        if qr_data:
            cv2.putText(overlay, f"QR: {qr_data[:40]}", (16, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 100), 2)
        cv2.imshow("ID Card Scanner", overlay)

        if cv2.waitKey(1) & 0xFF in (ord("q"), ord("Q")):
            break

    cap.release()
    cv2.destroyAllWindows()

    header_text = extract_prominent_header(frame)
    combined_text = ocr_text + ("\n" + qr_data if qr_data else "")
    if header_text:
        combined_text += "\nCOLLEGE_HEADER: " + header_text
    fields = parse_fields(combined_text)
    return ScanResult(
        raw_text=ocr_text,
        qr_data=qr_data,
        name=fields.get("name"),
        hostel_id=fields.get("student_id"),
        hostel=fields.get("hostel"),
        college=fields.get("college"),
        block=fields.get("block"),
        floor=fields.get("floor"),
        room=fields.get("room"),
        dob=fields.get("dob"),
        phone=fields.get("phone"),
        doc_type=fields.get("doc_type"),
    )


def scan_image(image_path: str) -> ScanResult:
    path = Path(image_path)
    if not path.exists():
        raise RuntimeError("Image file not found")

    image = cv2.imread(str(path))
    if image is None:
        raise RuntimeError("Unable to read image")

    qr_data = None
    barcodes = pyzbar.decode(image)
    if barcodes:
        qr_data = barcodes[0].data.decode("utf-8", errors="ignore")

    ocr_text = ocr_best(image)
    header_text = extract_prominent_header(image)

    combined_text = ocr_text + ("\n" + qr_data if qr_data else "")
    if header_text:
        combined_text += "\nCOLLEGE_HEADER: " + header_text
    fields = parse_fields(combined_text)
    return ScanResult(
        raw_text=ocr_text,
        qr_data=qr_data,
        name=fields.get("name"),
        hostel_id=fields.get("student_id"),
        hostel=fields.get("hostel"),
        college=fields.get("college"),
        block=fields.get("block"),
        floor=fields.get("floor"),
        room=fields.get("room"),
        dob=fields.get("dob"),
        phone=fields.get("phone"),
        doc_type=fields.get("doc_type"),
    )


if __name__ == "__main__":
    args = sys.argv[1:]
    if "--image" in args:
        idx = args.index("--image")
        image_path = args[idx + 1] if idx + 1 < len(args) else ""
        result = scan_image(image_path)
        payload = {
            "qr_data": result.qr_data,
            "name": result.name,
            "student_id": result.hostel_id,
            "college": result.college,
            "hostel": result.hostel,
            "block": result.block,
            "floor": result.floor,
            "room": result.room,
            "dob": result.dob,
            "phone": result.phone,
            "doc_type": result.doc_type,
            "raw_text": result.raw_text,
        }
        if "--json" in args:
            print(json.dumps(payload))
        else:
            print("\n--- Scan Result ---")
            for key, value in payload.items():
                if key == "raw_text":
                    continue
                print(f"{key}: {value}")
            print("\nRaw OCR:\n", result.raw_text)
    else:
        cam_index = int(args[0]) if len(args) > 0 else 0
        result = scan_camera(cam_index)
        print("\n--- Scan Result ---")
        print("QR Data:", result.qr_data)
        print("Name:", result.name)
        print("Hostel ID:", result.hostel_id)
        print("Hostel:", result.hostel)
        print("College:", result.college)
        print("Block:", result.block)
        print("Floor:", result.floor)
        print("Room:", result.room)
        print("\nRaw OCR:\n", result.raw_text)
