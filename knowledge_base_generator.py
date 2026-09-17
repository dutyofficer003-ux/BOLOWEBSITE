import os
import json
import re
from html.parser import HTMLParser

# Only strictly exclude admin-panel.html from knowledge base scanning
STRICTLY_BLOCKED_FILES = ['admin-panel.html']

def is_strictly_blocked(filename):
    lower = filename.lower()
    for b in STRICTLY_BLOCKED_FILES:
        if b in lower:
            return True
    return False

class SimpleHTMLScraper(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.headings = []
        self.paragraphs = []
        self.media = []
        self.in_title = False
        self.current_heading_tag = None
        self.current_heading_text = ""
        self.in_p = False
        self.current_p_text = ""

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        tag = tag.lower()
        if tag == 'title':
            self.in_title = True
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            self.current_heading_tag = tag
            self.current_heading_text = ""
        elif tag == 'p':
            self.in_p = True
            self.current_p_text = ""
        elif tag == 'img':
            src = attr_dict.get('src')
            if src and not src.startswith('data:'):
                self.media.append({'type': 'image', 'src': src, 'alt': attr_dict.get('alt', '')})
        elif tag in ['video', 'source']:
            src = attr_dict.get('src')
            if src:
                self.media.append({'type': 'video', 'src': src})

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == 'title':
            self.in_title = False
        elif tag in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']:
            if self.current_heading_text.strip():
                self.headings.append({'level': tag, 'text': self.current_heading_text.strip()})
            self.current_heading_tag = None
        elif tag == 'p':
            if self.current_p_text.strip():
                self.paragraphs.append(self.current_p_text.strip())
            self.in_p = False

    def handle_data(self, data):
        if self.in_title:
            self.title += data
        elif self.current_heading_tag:
            self.current_heading_text += data
        elif self.in_p:
            self.current_p_text += data

def scan_html_files(root_dir):
    kb_data = []
    public_files_count = 0
    skipped_files = []

    for root, dirs, files in os.walk(root_dir):
        if '.git' in root or 'node_modules' in root or '.system_generated' in root or '.gemini' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                rel_path = os.path.relpath(os.path.join(root, file), root_dir).replace('\\', '/')
                if is_strictly_blocked(file):
                    skipped_files.append(rel_path)
                    continue
                
                full_path = os.path.join(root, file)
                try:
                    with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()

                    parser = SimpleHTMLScraper()
                    parser.feed(content)

                    # Clean up text content
                    text_clean = re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', content)).strip()

                    file_info = {
                        "path": "/" + rel_path,
                        "filename": file,
                        "title": parser.title.strip(),
                        "headings": parser.headings,
                        "paragraphs": parser.paragraphs[:20],
                        "media": parser.media,
                        "snippet": text_clean[:1000]
                    }
                    kb_data.append(file_info)
                    public_files_count += 1
                except Exception as e:
                    print(f"Error reading {file}: {e}")

    print(f"Scanned {public_files_count} HTML files into Knowledge Base.")
    print(f"Skipped strictly blocked file: {skipped_files}")
    return kb_data

if __name__ == "__main__":
    workspace_dir = os.path.dirname(os.path.abspath(__file__))
    kb = scan_html_files(workspace_dir)
    kb_path = os.path.join(workspace_dir, "knowledge_base.json")
    with open(kb_path, "w", encoding="utf-8") as f:
        json.dump(kb, f, indent=2, ensure_ascii=False)
    print(f"Successfully updated {kb_path}")
