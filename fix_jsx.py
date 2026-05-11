import os
import re

jsx_files = [
    'LandingPage.jsx',
    'PatientLogin.jsx',
    'AdminLogin.jsx',
    'PatientDashboard.jsx',
    'AdminDashboard.jsx',
]

def fix_jsx(content):
    # HTML comments
    content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content, flags=re.DOTALL)
    
    return content

for file in jsx_files:
    path = os.path.join('frontend', 'src', 'pages', file)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        fixed_content = fix_jsx(content)
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
            
print("Fixed JSX comments.")
