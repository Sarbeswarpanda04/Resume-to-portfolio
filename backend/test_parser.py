import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.services.ai_parser import AIResumeParser

# Your CV text
cv_text = """
Curriculum Vitae
Name: Sarbeswar Panda

Address: At- Kendupalli post- Barabati, Nayagarh, Odisha,752077
Mob No: 8260916384
E-Mail ID: sarbeswar2023@gift.edu.in / sarbeswarwarpanda143@gmail.com
LinkedIn ID: https://www.linkedin.com/in/sarbeswar-panda/

CAREER OBJECTIVE

Computer Science student specializing in Artificial Intelligence with a strong foundation in C, Java, Data Structures, and Python. Passionate about solving real-world problems through AI-driven solutions and software development, with a focus on building scalable and impactful technologies. Eager to contribute my skills in an innovative environment while continuously expanding my technical expertise and professional growth.

EDUCATION
Pursuing BTECH in CSE at GIFT Autonomous college affiliated to Biju Patnaik University of Technology with CGPA 7.78.
Class of 2023
"""

def test_parse():
    print("Testing Google Gemini AI Parser...")
    parser = AIResumeParser()
    result = parser.parse_with_ai(cv_text, "minimal-dev")
    print("\n✅ AI Parsed Result:")
    print(f"Name: {result.get('name')}")
    print(f"Email: {result.get('email')}")
    print(f"Phone: {result.get('phone')}")
    print(f"Summary: {result.get('summary')}")
    print(f"\nSkills: {len(result.get('skills', []))} categories")
    print(f"Education: {len(result.get('education', []))} entries")
    
    print("\n📄 Full JSON Response:")
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_parse()
