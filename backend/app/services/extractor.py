import fitz  # PyMuPDF
import pandas as pd
import io
from fastapi import UploadFile

async def extract_text_from_file(file: UploadFile) -> str:
    content = await file.read()
    filename = file.filename.lower()
    
    # Reset file pointer for potential re-reads
    await file.seek(0)
    
    if filename.endswith(".pdf"):
        return extract_text_from_pdf(content)
    elif filename.endswith((".xlsx", ".xls")):
        return extract_text_from_excel(content)
    else:
        return content.decode("utf-8", errors="ignore")

def extract_text_from_pdf(content: bytes) -> str:
    doc = fitz.open(stream=content, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def extract_text_from_excel(content: bytes) -> str:
    df = pd.read_excel(io.BytesIO(content))
    return df.to_string()
