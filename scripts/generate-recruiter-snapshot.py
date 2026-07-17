from pathlib import Path
import shutil

from reportlab.lib import colors
from reportlab.lib.enums import TA_RIGHT
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf" / "maya-chen-recruiter-snapshot.pdf"
PUBLIC_COPY = ROOT / "public" / "demo" / "maya-chen-recruiter-snapshot.pdf"

NAVY = colors.HexColor("#07152E")
BLUE = colors.HexColor("#2563EB")
SKY = colors.HexColor("#DBEAFE")
INK = colors.HexColor("#0F172A")
MUTED = colors.HexColor("#52627A")
LINE = colors.HexColor("#D7E0EC")
PAPER = colors.HexColor("#F8FAFC")
WHITE = colors.white


def draw_wrapped(c, text, x, y, width, style):
    paragraph = Paragraph(text, style)
    _, height = paragraph.wrap(width, 3 * inch)
    paragraph.drawOn(c, x, y - height)
    return y - height


def label(c, text, x, y, color=MUTED):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold", 7.5)
    c.drawString(x, y, text.upper())


def metric(c, x, y, width, value, title, note):
    c.setFillColor(PAPER)
    c.roundRect(x, y, width, 0.68 * inch, 10, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(x + 12, y + 31, value)
    c.setFillColor(MUTED)
    c.setFont("Helvetica-Bold", 7.2)
    c.drawString(x + 12, y + 18, title.upper())
    c.setFont("Helvetica", 6.8)
    c.drawString(x + 12, y + 8, note)


def section_title(c, text, x, y, width):
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x, y, text)
    c.setStrokeColor(LINE)
    c.setLineWidth(0.7)
    line_x = x + stringWidth(text, "Helvetica-Bold", 10) + 10
    c.line(line_x, y + 2, x + width, y + 2)


def bullet(c, text, x, y, width, style):
    c.setFillColor(BLUE)
    c.circle(x + 2, y - 4, 1.6, fill=1, stroke=0)
    return draw_wrapped(c, text, x + 10, y, width - 10, style) - 5


def generate():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_COPY.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUTPUT), pagesize=LETTER)
    width, height = LETTER
    c.setTitle("Maya Chen - Recruiter Application Snapshot")
    c.setAuthor("MyPilotPage demo")

    c.setFillColor(WHITE)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    c.setFillColor(NAVY)
    c.rect(0, height - 2.17 * inch, width, 2.17 * inch, fill=1, stroke=0)
    c.setFillColor(BLUE)
    c.rect(0, height - 2.17 * inch, 0.13 * inch, 2.17 * inch, fill=1, stroke=0)

    margin = 0.58 * inch
    top = height - 0.50 * inch
    c.setFillColor(colors.HexColor("#9FC1FF"))
    c.setFont("Helvetica-Bold", 8)
    c.drawString(margin, top, "PILOT APPLICATION SNAPSHOT")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 27)
    c.drawString(margin, top - 31, "Maya Chen")
    c.setFont("Helvetica-Bold", 12)
    c.drawString(margin, top - 51, "CRJ-900 Captain  |  Denver, Colorado")
    c.setFillColor(colors.HexColor("#CBD9EF"))
    c.setFont("Helvetica", 9)
    c.drawString(margin, top - 70, "Part 121 captain preparing for a major-airline transition")

    right_x = width - margin
    c.setFillColor(colors.HexColor("#9FC1FF"))
    c.setFont("Helvetica-Bold", 7.5)
    c.drawRightString(right_x, top, "AVAILABILITY")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawRightString(right_x, top - 16, "Actively interviewing")
    c.setFont("Helvetica", 8.5)
    c.drawRightString(right_x, top - 31, "30 days notice")
    c.setFillColor(colors.HexColor("#9FC1FF"))
    c.setFont("Helvetica-Bold", 7.5)
    c.drawRightString(right_x, top - 56, "CONTACT")
    c.setFillColor(WHITE)
    c.setFont("Helvetica", 8.5)
    c.drawRightString(right_x, top - 72, "maya.chen@example.com")
    c.drawRightString(right_x, top - 87, "mypilotpage.com/p/demo")

    content_top = height - 2.43 * inch
    gap = 9
    metric_width = (width - 2 * margin - 3 * gap) / 4
    metrics = [
        ("10,684", "Total time", "logbook hours"),
        ("6,820", "Turbine PIC", "Part 121 captain"),
        ("2,940", "Multi-engine", "turbine aircraft"),
        ("1,860", "Part 121 SIC", "CRJ-700/900"),
    ]
    for index, item in enumerate(metrics):
        metric(c, margin + index * (metric_width + gap), content_top - 0.68 * inch, metric_width, *item)

    regular = ParagraphStyle("regular", fontName="Helvetica", fontSize=8.2, leading=11.2, textColor=INK)
    small = ParagraphStyle("small", fontName="Helvetica", fontSize=7.5, leading=10, textColor=MUTED)
    right = ParagraphStyle("right", parent=regular, alignment=TA_RIGHT)

    y = content_top - 0.91 * inch
    left_x = margin
    col_gap = 0.34 * inch
    left_w = 4.58 * inch
    right_col_x = left_x + left_w + col_gap
    right_w = width - margin - right_col_x

    section_title(c, "Qualifications", left_x, y, left_w)
    y -= 17
    y = bullet(c, "<b>ATP</b> with CFI, CFII, and MEI certificates", left_x, y, left_w, regular)
    y = bullet(c, "<b>CL-65 type rating</b> | CRJ-700/900 captain", left_x, y, left_w, regular)
    y = bullet(c, "First Class Medical | US Passport | FCC Restricted Radiotelephone", left_x, y, left_w, regular)
    y = bullet(c, "Authorized to work in the United States without sponsorship", left_x, y, left_w, regular)

    y -= 8
    section_title(c, "Professional experience", left_x, y, left_w)
    y -= 18
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(left_x, y, "Captain | SkyWest Airlines | CRJ-700/900")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(left_x + left_w, y, "2023 - Present")
    y -= 7
    y = draw_wrapped(c, "PIC responsibility in Part 121 operations with consistent performance in mountain, winter, high-density, and irregular operations. Known for calm decision-making, clear briefs, and thoughtful crew development.", left_x, y, left_w, regular) - 11
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(left_x, y, "First Officer | SkyWest Airlines | CRJ-700/900")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(left_x + left_w, y, "2020 - 2023")
    y -= 7
    y = draw_wrapped(c, "Built a reliable Part 121 foundation across DEN, DFW, PHX, ORD, and LAX, including deicing, high-altitude operations, and complex terminal environments.", left_x, y, left_w, regular) - 11
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(left_x, y, "Flight Instructor | Front Range Flight Academy")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 7.5)
    c.drawRightString(left_x + left_w, y, "2017 - 2020")
    y -= 7
    draw_wrapped(c, "Delivered private, instrument, commercial, and multi-engine training with an emphasis on risk management and cockpit communication.", left_x, y, left_w, regular)

    side_y = content_top - 0.91 * inch
    section_title(c, "Aircraft", right_col_x, side_y, right_w)
    side_y -= 18
    side_y = draw_wrapped(c, "<b>CRJ-900</b><br/>Captain and First Officer<br/><br/><b>CRJ-700</b><br/>Captain and First Officer<br/><br/><b>PA-44 / BE-76</b><br/>Instruction and multi-engine training", right_col_x, side_y, right_w, regular) - 14

    section_title(c, "Operational strengths", right_col_x, side_y, right_w)
    side_y -= 18
    side_y = bullet(c, "Mountain and high-altitude airports", right_col_x, side_y, right_w, small)
    side_y = bullet(c, "Winter operations and deicing", right_col_x, side_y, right_w, small)
    side_y = bullet(c, "High-density terminal environments", right_col_x, side_y, right_w, small)
    side_y = bullet(c, "CRM and crew development", right_col_x, side_y, right_w, small)
    side_y = bullet(c, "Irregular-operations decision-making", right_col_x, side_y, right_w, small)

    side_y -= 8
    section_title(c, "Recent logbook activity", right_col_x, side_y, right_w)
    side_y -= 18
    draw_wrapped(c, "Latest 90 days<br/><b>148.6 hours</b> | 82 flights<br/><br/>Latest 6 months<br/><b>18.4 instrument hours</b>", right_col_x, side_y, right_w, regular)

    c.setStrokeColor(LINE)
    c.line(margin, 0.53 * inch, width - margin, 0.53 * inch)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 6.5)
    c.drawString(margin, 0.35 * inch, "Fictional demonstration profile. Flight totals are pilot-provided logbook data and are not a regulatory currency determination.")
    c.drawRightString(width - margin, 0.35 * inch, "Generated by MyPilotPage")

    c.showPage()
    c.save()
    shutil.copyfile(OUTPUT, PUBLIC_COPY)


if __name__ == "__main__":
    generate()
