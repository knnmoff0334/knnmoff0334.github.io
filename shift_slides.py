import os
import re

slides_dir = r"c:\Users\orkha\Desktop\test\slides"
start_index = 8
end_index = 29

# Iterate backwards to avoid overwriting
for i in range(end_index, start_index - 1, -1):
    old_filename = f"slide-{i}.html"
    new_filename = f"slide-{i+1}.html"
    
    old_path = os.path.join(slides_dir, old_filename)
    new_path = os.path.join(slides_dir, new_filename)
    
    if os.path.exists(old_path):
        print(f"Processing {old_filename} -> {new_filename}")
        
        # Read content
        with open(old_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Update ID
        # Regex to find id="slide-X" and replace with id="slide-X+1"
        # We use specific replacement to avoid false positives
        old_id_str = f'id="slide-{i}"'
        new_id_str = f'id="slide-{i+1}"'
        
        new_content = content.replace(old_id_str, new_id_str)
        
        # Write to new path
        with open(new_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
            
        # Remove old file (optional, but cleaner to just rename if we were sure, 
        # but here we read/write to ensure content update)
        os.remove(old_path)
    else:
        print(f"Warning: {old_filename} not found")

print("Shift complete.")
