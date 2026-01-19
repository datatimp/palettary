import json
import os

palettes_dir = '/home/datatimp/repos/palettary/src/assets/palettes'
contributor_handle = "datatimp"
contributor_link = "https://datatimp.github.io"

# Iterate over all files in the directory
for filename in os.listdir(palettes_dir):
    if filename.endswith(".json") and filename != "manifest.json":
        filepath = os.path.join(palettes_dir, filename)
        
        try:
            with open(filepath, 'r') as f:
                data = json.load(f)
            
            # Update fields
            data['contributor_handle'] = contributor_handle
            data['contributor_link'] = contributor_link
            
            with open(filepath, 'w') as f:
                json.dump(data, f, indent=2)
                
            print(f"Updated {filename}")
            
        except Exception as e:
            print(f"Error updating {filename}: {e}")

print("Batch update complete.")
