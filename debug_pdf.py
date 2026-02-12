import fitz
try:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "Hello World", fontname="helv", fontsize=12)
    pdf_bytes = doc.write()
    doc.close()
    print("PDF generation successful")
    with open("debug.pdf", "wb") as f:
        f.write(pdf_bytes)
except Exception as e:
    print(f"PDF generation failed: {e}")
