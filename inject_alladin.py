import os
import re

ADMIN_KEYWORDS = ['admin', 'dashboard', 'hidden', 'backup']

def is_admin_file(filename):
    lower = filename.lower()
    for kw in ADMIN_KEYWORDS:
        if kw in lower:
            return True
    return False

THREE_JS_TAG = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'
ALLADIN_SCRIPT_TAG = '<script src="/alladin-engine.js"></script>'
ALLADIN_NAV_LINK = '<a href="/alladin.html" class="alladin-nav-item" style="color: #FFD700; font-weight: bold; text-shadow: 0 0 8px rgba(255,215,0,0.6);">ALLADIN AI</a>'

def patch_html_file(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    modified = False

    # 1. Inject Three.js Script Tag if missing
    if 'three.min.js' not in content:
        if '</head>' in content:
            content = content.replace('</head>', f'    {THREE_JS_TAG}\n</head>')
            modified = True

    # 2. Inject ALLADIN Engine Script Tag if missing
    if 'alladin-engine.js' not in content:
        if '</body>' in content:
            content = content.replace('</body>', f'    {ALLADIN_SCRIPT_TAG}\n</body>')
            modified = True
        elif '</head>' in content:
            content = content.replace('</head>', f'    {ALLADIN_SCRIPT_TAG}\n</head>')
            modified = True

    # 3. Inject Navigation Link into Nav and SideMenu
    if 'alladin.html' not in content and file_path.endswith('alladin.html') == False:
        # Patch desktop <nav>
        nav_match = re.search(r'(<nav[^>]*>)(.*?)(</nav>)', content, re.DOTALL | re.IGNORECASE)
        if nav_match:
            nav_open = nav_match.group(1)
            nav_inner = nav_match.group(2)
            nav_close = nav_match.group(3)
            if 'alladin.html' not in nav_inner:
                new_nav_inner = nav_inner + f'\n    {ALLADIN_NAV_LINK}'
                content = content.replace(nav_match.group(0), nav_open + new_nav_inner + nav_close)
                modified = True

        # Patch sideMenu / mobile menu
        side_match = re.search(r'(<div[^>]*id=["\']sideMenu["\'][^>]*>)(.*?)(</div>)', content, re.DOTALL | re.IGNORECASE)
        if side_match:
            side_open = side_match.group(1)
            side_inner = side_match.group(2)
            side_close = side_match.group(3)
            if 'alladin.html' not in side_inner:
                new_side_inner = side_inner + f'\n    {ALLADIN_NAV_LINK}'
                content = content.replace(side_match.group(0), side_open + new_side_inner + side_close)
                modified = True

    if modified:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    workspace_dir = os.path.dirname(os.path.abspath(__file__))
    patched_count = 0
    skipped_admin = []
    processed_files = 0

    for root, dirs, files in os.walk(workspace_dir):
        if '.git' in root or 'node_modules' in root or '.system_generated' in root or '.gemini' in root:
            continue
        for file in files:
            if file.endswith('.html'):
                if is_admin_file(file):
                    skipped_admin.append(file)
                    continue

                full_path = os.path.join(root, file)
                processed_files += 1
                if patch_html_file(full_path):
                    patched_count += 1

    print(f"Processed {processed_files} public HTML files.")
    print(f"Patched {patched_count} files with Three.js / ALLADIN integration.")
    print(f"Skipped admin files: {skipped_admin}")

if __name__ == "__main__":
    main()
