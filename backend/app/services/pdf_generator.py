"""
PDF Generator v2 — Branded multi-page audit report.
Uses PyMuPDF (fitz) with Cyrillic font support.
"""
import fitz
import io
from datetime import datetime
from typing import Dict, Any, List, Optional

# Brand colors (RGB 0-1)
BRAND_ORANGE = (0.976, 0.451, 0.086)   # #F97316
DARK_BG      = (0.039, 0.059, 0.110)   # #0A0F1C
TEXT_BLACK    = (0.1, 0.1, 0.12)
TEXT_GRAY     = (0.45, 0.45, 0.50)
TEXT_LIGHT    = (0.65, 0.65, 0.70)
RED_RISK      = (0.90, 0.25, 0.20)
GREEN_OK      = (0.20, 0.75, 0.35)
LINE_GRAY     = (0.88, 0.88, 0.90)
WHITE         = (1, 1, 1)


class PDFGeneratorService:

    # Font paths — priority order (Cyrillic support required)
    FONT_REGULAR_CANDIDATES = [
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    FONT_BOLD_CANDIDATES = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    ]

    def _find_font(self, candidates: list) -> Optional[str]:
        """Find first available font file from candidate list."""
        import os
        for path in candidates:
            if os.path.exists(path):
                return path
        return None

    def _setup_fonts(self, page):
        """Register Cyrillic-capable fonts on a page. Returns (regular_name, bold_name)."""
        reg_path = self._find_font(self.FONT_REGULAR_CANDIDATES)
        bold_path = self._find_font(self.FONT_BOLD_CANDIDATES)

        fr = "F1"
        fb = "F2"

        if reg_path:
            page.insert_font(fontname=fr, fontfile=reg_path)
        else:
            fr = "helv"

        if bold_path:
            page.insert_font(fontname=fb, fontfile=bold_path)
        else:
            fb = "hebo"

        return fr, fb

    def generate_audit_report(self, proposal_data: Dict[str, Any]) -> bytes:
        """
        Generates a professional branded engineering audit report in PDF format.
        Multi-page: cover, specs, risks, equipment, summary.
        """
        doc = fitz.open()
        parsed = proposal_data.get("parsed_data", {})
        risks = proposal_data.get("risks", [])
        shpunts = proposal_data.get("matched_shpunts", [])
        machinery = proposal_data.get("recommended_machinery", [])
        summary_text = proposal_data.get("technical_summary", "")
        confidence = proposal_data.get("confidence_score", 0)
        estimated = proposal_data.get("estimated_total")
        now = datetime.now()

        # ─── Font names (set per page via _setup_fonts) ───
        self._fr = "helv"  # regular
        self._fb = "hebo"  # bold

        def new_page():
            page = doc.new_page(width=595, height=842)  # A4
            self._fr, self._fb = self._setup_fonts(page)
            return page

        def add_footer(page):
            """Add branded footer to every page."""
            y = 810
            page.draw_line((40, y), (555, y), color=LINE_GRAY, width=0.5)
            page.insert_text(
                (40, y + 14), "Terra Expert  •  geotech-hub.ru",
                fontname=self._fr, fontsize=7, color=TEXT_LIGHT,
            )
            page.insert_text(
                (430, y + 14), f"Отчет от {now.strftime('%d.%m.%Y %H:%M')}",
                fontname=self._fr, fontsize=7, color=TEXT_LIGHT,
            )

        def draw_section_title(page, y: float, title: str) -> float:
            """Draw section header with orange accent line."""
            page.draw_line((40, y), (555, y), color=LINE_GRAY, width=0.5)
            y += 18
            page.draw_rect(fitz.Rect(40, y - 2, 44, y + 12), color=BRAND_ORANGE, fill=BRAND_ORANGE)
            page.insert_text(
                (52, y + 10), title.upper(),
                fontname=self._fb, fontsize=11, color=TEXT_BLACK,
            )
            return y + 30

        # ═══════════════════════════════════════
        # PAGE 1: Cover / Header + Specs
        # ═══════════════════════════════════════
        p1 = new_page()

        # Top brand bar
        p1.draw_rect(fitz.Rect(0, 0, 595, 90), fill=DARK_BG)
        p1.insert_text(
            (40, 35), "DIGITAL GEOTECH HUB",
            fontname=self._fb, fontsize=20, color=BRAND_ORANGE,
        )
        p1.insert_text(
            (40, 55), "Экспертный AI-аудит инженерно-геологической документации",
            fontname=self._fr, fontsize=9, color=(0.7, 0.7, 0.75),
        )
        # Date + confidence badge
        p1.insert_text(
            (400, 35), now.strftime("%d %B %Y"),
            fontname=self._fr, fontsize=9, color=(0.7, 0.7, 0.75),
        )
        conf_pct = f"{confidence * 100:.0f}%" if confidence else "—"
        conf_color = GREEN_OK if confidence and confidence >= 0.7 else RED_RISK
        p1.insert_text(
            (400, 55), f"Уверенность: {conf_pct}",
            fontname=self._fb, fontsize=9, color=conf_color,
        )

        # ── Section 1: Project Specifications ──
        y = 110
        y = draw_section_title(p1, y, "Параметры проекта")

        spec_items = [
            ("Тип работ",      str(parsed.get("work_type", "—"))),
            ("Объем",          f'{parsed.get("volume", "—")}' + (" т" if parsed.get("volume") else "")),
            ("Глубина",        f'{parsed.get("depth", "—")}' + (" м" if parsed.get("depth") else "")),
            ("Тип грунта",     str(parsed.get("soil_type", "—"))),
            ("Требуемый профиль", str(parsed.get("required_profile", "—"))),
            ("Уровень грунтовых вод", f'{parsed.get("groundwater_level", "—")}' + (" м" if parsed.get("groundwater_level") else "")),
        ]

        for label, value in spec_items:
            # Label
            p1.insert_text((52, y + 10), label + ":", fontname=self._fr, fontsize=9, color=TEXT_GRAY)
            # Value
            p1.insert_text((200, y + 10), value, fontname=self._fb, fontsize=9, color=TEXT_BLACK)
            y += 20

        # Special conditions
        specials = parsed.get("special_conditions", [])
        if specials:
            y += 5
            p1.insert_text((52, y + 10), "Особые условия:", fontname=self._fr, fontsize=9, color=TEXT_GRAY)
            y += 18
            for cond in specials[:5]:
                p1.insert_text((70, y + 10), f"• {cond}", fontname=self._fr, fontsize=8, color=TEXT_BLACK)
                y += 14

        # Estimated total
        if estimated:
            y += 15
            p1.draw_rect(fitz.Rect(40, y, 555, y + 40), fill=(0.95, 0.98, 0.95))
            p1.draw_rect(fitz.Rect(40, y, 44, y + 40), fill=GREEN_OK)
            p1.insert_text(
                (55, y + 15), "ПРЕДВАРИТЕЛЬНАЯ СМЕТА",
                fontname=self._fr, fontsize=8, color=TEXT_GRAY,
            )
            p1.insert_text(
                (55, y + 30), f"{estimated:,.0f} ₽".replace(",", " "),
                fontname=self._fb, fontsize=14, color=GREEN_OK,
            )
            y += 50

        # ── Section 2: Risk Matrix ──
        if risks:
            y += 10
            y = draw_section_title(p1, y, f"Матрица рисков ({len(risks)})")

            for i, risk in enumerate(risks[:6]):
                if y > 740:
                    add_footer(p1)
                    p1 = new_page()
                    y = 50
                    y = draw_section_title(p1, y, "Матрица рисков (продолжение)")

                # Risk card
                p1.draw_rect(fitz.Rect(40, y, 555, y + 40), fill=(1, 0.97, 0.96))
                p1.draw_rect(fitz.Rect(40, y, 44, y + 40), fill=RED_RISK)
                # Number
                p1.insert_text(
                    (52, y + 14), f"R{i + 1}",
                    fontname=self._fb, fontsize=8, color=RED_RISK,
                )
                # Title
                risk_text = str(risk.get("risk", ""))[:80]
                p1.insert_text(
                    (75, y + 14), risk_text,
                    fontname=self._fb, fontsize=8, color=TEXT_BLACK,
                )
                # Impact
                impact_text = str(risk.get("impact", ""))[:100]
                p1.insert_text(
                    (75, y + 30), impact_text,
                    fontname=self._fr, fontsize=7, color=TEXT_GRAY,
                )
                y += 48

        add_footer(p1)

        # ═══════════════════════════════════════
        # PAGE 2: Equipment + Technical Summary
        # ═══════════════════════════════════════
        p2 = new_page()
        y = 50

        # ── Section 3: Matched Equipment ──
        if shpunts or machinery:
            y = draw_section_title(p2, y, "Подобранное оборудование")

            if shpunts:
                p2.insert_text((52, y + 10), "Шпунт:", fontname=self._fb, fontsize=9, color=TEXT_BLACK)
                y += 22

                # Table header
                p2.draw_rect(fitz.Rect(52, y, 540, y + 18), fill=(0.95, 0.95, 0.97))
                p2.insert_text((60, y + 12), "Название", fontname=self._fb, fontsize=7, color=TEXT_GRAY)
                p2.insert_text((300, y + 12), "Цена", fontname=self._fb, fontsize=7, color=TEXT_GRAY)
                p2.insert_text((420, y + 12), "На складе", fontname=self._fb, fontsize=7, color=TEXT_GRAY)
                y += 20

                for s in shpunts[:8]:
                    name = str(s.get("name", "—"))[:40]
                    price = s.get("price", 0)
                    stock = s.get("stock", 0)
                    p2.insert_text((60, y + 12), name, fontname=self._fr, fontsize=8, color=TEXT_BLACK)
                    p2.insert_text((300, y + 12), f"{price:,.0f} ₽".replace(",", " "), fontname=self._fr, fontsize=8, color=TEXT_BLACK)
                    p2.insert_text((420, y + 12), f"{stock} шт", fontname=self._fr, fontsize=8, color=TEXT_BLACK)
                    p2.draw_line((52, y + 18), (540, y + 18), color=LINE_GRAY, width=0.3)
                    y += 22

                y += 10

            if machinery:
                p2.insert_text((52, y + 10), "Рекомендуемая техника:", fontname=self._fb, fontsize=9, color=TEXT_BLACK)
                y += 22

                p2.draw_rect(fitz.Rect(52, y, 540, y + 18), fill=(0.95, 0.95, 0.97))
                p2.insert_text((60, y + 12), "Техника", fontname=self._fb, fontsize=7, color=TEXT_GRAY)
                p2.insert_text((350, y + 12), "Категория", fontname=self._fb, fontsize=7, color=TEXT_GRAY)
                y += 20

                for m in machinery[:8]:
                    name = str(m.get("name", "—"))[:45]
                    cat = str(m.get("category", "—"))[:30]
                    p2.insert_text((60, y + 12), name, fontname=self._fr, fontsize=8, color=TEXT_BLACK)
                    p2.insert_text((350, y + 12), cat, fontname=self._fr, fontsize=8, color=TEXT_BLACK)
                    p2.draw_line((52, y + 18), (540, y + 18), color=LINE_GRAY, width=0.3)
                    y += 22

                y += 10

        # ── Section 4: Technical Summary ──
        if summary_text:
            if y > 550:
                add_footer(p2)
                p2 = new_page()
                y = 50

            y = draw_section_title(p2, y, "Экспертное резюме")

            # Use textbox for word-wrapping
            rect = fitz.Rect(52, y, 540, 780)
            p2.insert_textbox(
                rect,
                summary_text[:3000],
                fontname=self._fr,
                fontsize=8.5,
                color=TEXT_BLACK,
                align=fitz.TEXT_ALIGN_LEFT,
            )

        add_footer(p2)

        # ═══════════════════════════════════════
        # Finalize
        # ═══════════════════════════════════════
        # Set PDF metadata
        doc.set_metadata({
            "title": f"Геотехнический AI-аудит — {parsed.get('work_type', 'Отчет')}",
            "author": "Terra Expert",
            "subject": "Engineering Audit Report",
            "creator": "DGH AI Pipeline v2",
            "producer": f"PyMuPDF {fitz.VersionBind}",
            "creationDate": now.strftime("D:%Y%m%d%H%M%S"),
        })

        pdf_bytes = doc.write()
        doc.close()
        return pdf_bytes


pdf_generator = PDFGeneratorService()
