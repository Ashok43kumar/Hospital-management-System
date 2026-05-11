import os
import re

html_files = {
    '41fd.html': 'LandingPage.jsx',
    'patient-login.html': 'PatientLogin.jsx',
    'admin-login.html': 'AdminLogin.jsx',
    'patient-dashboard.html': 'PatientDashboard.jsx',
    'admin-dashboard.html': 'AdminDashboard.jsx',
}

def html_to_jsx(html_content):
    match = re.search(r'<body[^>]*>(.*)</body>', html_content, re.DOTALL | re.IGNORECASE)
    if not match:
        return ""
    
    body = match.group(1)
    
    # Remove HTML comments
    body = re.sub(r'<!--.*?-->', '', body, flags=re.DOTALL)
    
    # Simple conversions
    body = body.replace('class=', 'className=')
    body = body.replace('for=', 'htmlFor=')
    
    # Self-closing tags (avoiding double closing)
    def fix_self_closing(m):
        tag = m.group(1)
        attrs = m.group(2)
        if attrs.endswith('/'):
            return f'<{tag}{attrs}>'
        return f'<{tag}{attrs} />'
        
    body = re.sub(r'<(img|input|hr|br)([^>]*)>', fix_self_closing, body)
    
    # Remove script tags that might be in body
    body = re.sub(r'<script.*?</script>', '', body, flags=re.DOTALL)
    
    # JSX attribute conversions
    body = re.sub(r'stroke-width=', 'strokeWidth=', body)
    body = re.sub(r'stroke-linecap=', 'strokeLinecap=', body)
    body = re.sub(r'stroke-linejoin=', 'strokeLinejoin=', body)
    body = re.sub(r'fill-rule=', 'fillRule=', body)
    body = re.sub(r'clip-rule=', 'clipRule=', body)
    body = re.sub(r'xmlns:xlink=', 'xmlnsXlink=', body)
    body = re.sub(r'stroke-miterlimit=', 'strokeMiterlimit=', body)
    body = re.sub(r'stop-color=', 'stopColor=', body)
    body = re.sub(r'xml:space=', 'xmlSpace=', body)
    
    # Wipe inline styles to prevent compilation errors (can restore manually if needed)
    body = re.sub(r'style="[^"]*"', '', body)
    
    return body.strip()

os.makedirs('frontend/src/pages', exist_ok=True)

for html_file, jsx_file in html_files.items():
    if os.path.exists(html_file):
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        jsx_body = html_to_jsx(content)
        
        component_name = jsx_file.replace('.jsx', '')
        
        jsx_content = f"""import React from 'react';

const {component_name} = () => {{
  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col">
      {jsx_body}
    </div>
  );
}};

export default {component_name};
"""
        
        with open(f'frontend/src/pages/{jsx_file}', 'w', encoding='utf-8') as f:
            f.write(jsx_content)
            
print("Generated JSX files with fixed self-closing tags.")
