import fitz  # PyMuPDF
import pandas as pd
import io
import re
from typing import Dict, List, Any, Optional
from fastapi import UploadFile

class DocumentProcessor:
    """
    High-fidelity document processor for geotechnical documentation.
    Extracts text, preserves structure, and identifies key technical sections.
    """
    
    def __init__(self):
        # Keywords for section identification
        self.sections = {
            "geology": ["инженерно-геологические", "грунты", "разрез", "геология"],
            "construction": ["конструктивные решения", "ограждение", "шпунт", "сваи"],
            "hydrology": ["гидрогеологические", "угв", "уровень вод", "подземные воды"],
            "project_info": ["заказчик", "объект", "адрес", "местоположение"]
        }

    async def process_file(self, file: UploadFile) -> Dict[str, Any]:
        content = await file.read()
        filename = file.filename.lower()
        await file.seek(0)
        
        if filename.endswith(".pdf"):
            return self._process_pdf(content)
        elif filename.endswith((".xlsx", ".xls")):
            return self._process_excel(content)
        else:
            text = content.decode("utf-8", errors="ignore")
            return {"full_text": text, "metadata": {"filename": filename, "type": "text"}}

    def _process_pdf(self, content: bytes) -> Dict[str, Any]:
        doc = fitz.open(stream=content, filetype="pdf")
        full_text = ""
        structured_content = []
        
        for page_num, page in enumerate(doc):
            text = page.get_text("text")
            full_text += f"\n--- Page {page_num + 1} ---\n{text}"
            structured_content.append({
                "page": page_num + 1,
                "text": text,
                "tables": self._extract_tables_from_page(page)
            })
            
        metadata = {
            "pages": len(doc),
            "title": doc.metadata.get("title", ""),
            "author": doc.metadata.get("author", "")
        }
        
        # Basic section detection in full text
        detected_sections = self._detect_sections(full_text)
        
        return {
            "full_text": full_text,
            "metadata": metadata,
            "sections": detected_sections,
            "structured": structured_content
        }

    def _process_excel(self, content: bytes) -> Dict[str, Any]:
        # Using pandas for robust excel reading
        excel_file = pd.ExcelFile(io.BytesIO(content))
        sheets_data = {}
        full_text = ""
        
        for sheet_name in excel_file.sheet_names:
            df = excel_file.parse(sheet_name)
            sheet_text = df.to_string()
            sheets_data[sheet_name] = df.to_dict(orient="records")
            full_text += f"\n--- Sheet: {sheet_name} ---\n{sheet_text}"
            
        return {
            "full_text": full_text,
            "sheets": sheets_data,
            "metadata": {"sheets": excel_file.sheet_names, "type": "spreadsheet"}
        }

    def _extract_tables_from_page(self, page) -> List[Any]:
        # Placeholder for more advanced table extraction (e.g. using page.find_tables())
        # PyMuPDF has basic table support we can leverage later
        return []

    def _detect_sections(self, text: str) -> Dict[str, str]:
        results = {}
        for section_name, keywords in self.sections.items():
            for kw in keywords:
                if kw.lower() in text.lower():
                    # Attempt to extract context around the keyword
                    match = re.search(f"(?i).{{0,200}}{kw}.{{0,1000}}", text)
                    if match:
                        results[section_name] = match.group(0)
                        break
        return results

# Singleton instance
doc_processor = DocumentProcessor()
