import os
import re
import sys
from pathlib import Path

# Set stdout encoding to UTF-8 to handle Unicode characters
if sys.platform == 'win32':
    import codecs
    sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')

def process_html_file(file_path):
    """Process a single HTML file to inject anti-flash styles and data-translate attributes."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        modified = False
        
        # Check if anti-flash style is already present
        anti_flash_pattern = r'<style\s+id="early-anti-flash">'
        if not re.search(anti_flash_pattern, content, re.IGNORECASE):
            # Find the opening <head> tag and inject after it
            head_pattern = r'(<head[^>]*>)'
            match = re.search(head_pattern, content, re.IGNORECASE)
            if match:
                head_end = match.end()
                injection = '''<style id="early-anti-flash">html { display: none !important; }</style>
    <script src="/local-router.js"></script>
    '''
                content = content[:head_end] + injection + content[head_end:]
                modified = True
                print(f"  ✓ Injected anti-flash styles in {os.path.basename(file_path)}")
            else:
                print(f"  ⚠ No <head> tag found in {os.path.basename(file_path)}")
        else:
            print(f"  - Anti-flash styles already present in {os.path.basename(file_path)}")
        
        # Add data-translate attributes to user-facing tags
        # Tags to process: h1, h2, h3, h4, p, span, button
        # Also handle input placeholders
        
        tags_to_process = ['h1', 'h2', 'h3', 'h4', 'p', 'span', 'button']
        
        for tag in tags_to_process:
            # Pattern to find opening tags without data-translate attribute
            # This matches <tag> or <tag class="..."> etc., but not if data-translate is already present
            pattern = rf'(<{tag}\b[^>]*?)(?<!data-translate=)(>)'
            
            def add_data_translate(match):
                tag_content = match.group(1)
                closing = match.group(2)
                # Check if data-translate is already in the tag attributes
                if 'data-translate' in tag_content.lower():
                    return match.group(0)
                return tag_content + ' data-translate' + closing
            
            new_content = re.sub(pattern, add_data_translate, content, flags=re.IGNORECASE)
            if new_content != content:
                content = new_content
                modified = True
        
        # Handle input placeholders
        input_pattern = r'(<input\b[^>]*?placeholder=["\'][^"\']*["\'][^>]*?)(?<!data-translate=)(>)'
        
        def add_data_translate_to_input(match):
            tag_content = match.group(1)
            closing = match.group(2)
            if 'data-translate' in tag_content.lower():
                return match.group(0)
            return tag_content + ' data-translate' + closing
        
        new_content = re.sub(input_pattern, add_data_translate_to_input, content, flags=re.IGNORECASE)
        if new_content != content:
            content = new_content
            modified = True
        
        if modified:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"  ✓ Modified {os.path.basename(file_path)}")
        else:
            print(f"  - No changes needed for {os.path.basename(file_path)}")
            
    except Exception as e:
        print(f"  ✗ Error processing {file_path}: {e}")

def main():
    """Main function to scan and process all HTML files."""
    workspace = Path(__file__).parent
    html_files = list(workspace.glob('*.html'))
    
    print(f"Found {len(html_files)} HTML files to process\n")
    
    for html_file in html_files:
        print(f"Processing: {html_file.name}")
        process_html_file(html_file)
        print()
    
    print("✓ Processing complete!")

if __name__ == "__main__":
    main()
