import os
import shutil

def shift_slides():
    base_dir = r"c:\Users\orkha\Desktop\test\slides"
    
    # Range of slides to shift: 28 down to 7 (inclusive)
    # Target range: 29 down to 8
    start_slide = 7
    end_slide = 28
    
    print(f"Shifting slides from {start_slide} to {end_slide}...")
    
    # Iterate in reverse order to avoid overwriting
    for i in range(end_slide, start_slide - 1, -1):
        src = os.path.join(base_dir, f"slide-{i}.html")
        dst = os.path.join(base_dir, f"slide-{i+1}.html")
        
        if os.path.exists(src):
            print(f"Renaming {src} to {dst}")
            try:
                os.rename(src, dst)
            except Exception as e:
                print(f"Error renaming {src}: {e}")
        else:
            print(f"Warning: {src} does not exist")

if __name__ == "__main__":
    shift_slides()
