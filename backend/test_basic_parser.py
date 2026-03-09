from app.services.resume_parser import ResumeParser

cv_text = """
Curriculum Vitae
Name: Sarbeswar Panda

Address: At- Kendupalli post- Barabati, Nayagarh, Odisha,752077
Mob No: 8260916384
E-Mail ID: sarbeswar2023@gift.edu.in / sarbeswarwarpanda143@gmail.com
LinkedIn ID: https://www.linkedin.com/in/sarbeswar-panda/

CAREER OBJECTIVE

Computer Science student specializing in Artificial Intelligence with a strong foundation in C, Java, Data Structures, and Python. Passionate about solving real-world problems through AI-driven solutions and software development, with a focus on building scalable and impactful technologies. Eager to contribute my skills in an innovative environment while continuously expanding my technical expertise and professional growth.
"""

parser = ResumeParser()
parsed = parser.parse_resume(cv_text)

print("Parsed Resume Data:")
print(f"Name: {parsed.name}")
print(f"Email: {parsed.email}")
print(f"Phone: {parsed.phone}")
print(f"Title: {parsed.title}")
print(f"LinkedIn: {parsed.links.linkedin if parsed.links else 'None'}")
