import pdfplumber

pdf_file_name = '/Users/baasilali/Documents/baasilali_resume.pdf'

def extract_text_with_spacing(pdf_path):
    with pdfplumber.open(pdf_path) as pdf:
        full_text = ''
        for page in pdf.pages:
            text = page.extract_text(x_tolerance=2)  # x_tolerance can be adjusted based on your PDF
            if text:
                full_text += text + '\n'
        return full_text

text_with_spaces = extract_text_with_spacing(pdf_file_name)
print(text_with_spaces)