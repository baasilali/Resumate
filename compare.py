import PyPDF2
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
import re

# Ensure necessary nltk packages are downloaded
import nltk
nltk.download('punkt', quiet=True)
nltk.download('stopwords', quiet=True)

# Add a custom stopword list
custom_stopwords = set(stopwords.words('english')).union({
    "good", "nice", "end", "basic", "preferably", "excellent", "strong", 
    "abilities", "skills", "understanding", "learn", "knowledge", "self", 
    "platforms", "control", "field", "related", "degree", "motivated", 
    "science", "technologies", "familiarity", "methodologies", "eager",
    "version", "systems"
})

def extract_text_from_pdf(file_path):
    with open(file_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            text += page.extract_text()
    return text

def preprocess_text(text):
    # Remove non-word characters and convert to lowercase
    text = re.sub(r'\W+', ' ', text.lower())
    tokens = word_tokenize(text)
    
    # Remove stopwords and very short words
    filtered_tokens = [
        word for word in tokens 
        if word not in custom_stopwords and len(word) > 2
    ]
    return filtered_tokens

def find_keywords_in_resume(job_description_text, resume_text):
    # Preprocess job description and resume text
    job_keywords = preprocess_text(job_description_text)
    resume_words = preprocess_text(resume_text)
    
    # Convert to sets for easy comparison
    job_keyword_set = set(job_keywords)
    resume_word_set = set(resume_words)
    
    # Identify matched and missed keywords
    matched_keywords = job_keyword_set.intersection(resume_word_set)
    missed_keywords = job_keyword_set - resume_word_set
    
    return matched_keywords, missed_keywords

def compare_resume_to_job_description(resume_path, job_description_text):
    # Extract text from resume
    resume_text = extract_text_from_pdf(resume_path)
    
    # Find keywords in the resume
    matched_keywords, missed_keywords = find_keywords_in_resume(job_description_text, resume_text)
    
    # Calculate similarity score
    score = (len(matched_keywords) / len(matched_keywords | missed_keywords)) * 100 if matched_keywords or missed_keywords else 0
    
    return score, matched_keywords, missed_keywords

# Example Usage
if __name__ == "__main__":
    # Example file paths (replace with actual paths)
    resume_file_path = "/Users/baasilali/Documents/baasilali_resume.pdf"
    job_description = """

    Bachelor's degree in Computer Science, Software Engineering, or a related field. 
    Strong knowledge of Python programming language. 
    Familiarity with web frameworks such as Django or Flask. 
    Experience with version control systems, preferably Git. 
    Basic understanding of front-end technologies (HTML, CSS, JavaScript). 
    Good problem-solving and analytical skills. 
    Excellent communication and teamwork abilities. 
    Self-motivated and eager to learn. 

    Nice to have:

    Experience with database systems such as MySQL, PostgreSQL, or MongoDB. 
    Knowledge of RESTful APIs and integration. 
    Familiarity with cloud platforms such as AWS or Azure. 
    Understanding of agile development methodologies.

    """
    
    score, matched_keywords, missed_keywords = compare_resume_to_job_description(resume_file_path, job_description)
    print(f"Compatablility Score: {score:.2f}%")
    print(f"Matched Keywords: {', '.join(matched_keywords)}")
    print(f"Missed Keywords: {', '.join(missed_keywords)}")