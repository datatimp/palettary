#!/usr/bin/env python3
"""
Palette Removal Script for Palettary

Safely removes a palette from the system by deleting its file
and updating the manifest.

Usage:
    python remove-palette.py <palette-id>

Example:
    python src/assets/scripts/remove-palette.py japanese-woodblock
"""

import json
import sys
import os


def remove_palette(palette_id, palettes_dir, manifest_path):
    """
    Remove a palette and update the manifest.

    Args:
        palette_id: ID of the palette to remove
        palettes_dir: Directory containing palette files
        manifest_path: Path to manifest.json

    Returns:
        True if successful, False otherwise
    """
    palette_file = os.path.join(palettes_dir, f"{palette_id}.json")

    # Check if palette file exists
    if not os.path.exists(palette_file):
        print(f"✗ Error: Palette file not found: {palette_file}")
        return False

    # Load manifest
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)
    except Exception as e:
        print(f"✗ Error loading manifest: {e}")
        return False

    # Find palette in manifest
    palette_entry = None
    palette_index = None

    for i, entry in enumerate(manifest["palettes"]):
        if entry["id"] == palette_id:
            palette_entry = entry
            palette_index = i
            break

    if palette_entry is None:
        print(f"✗ Warning: Palette '{palette_id}' not found in manifest")
        print(f"  File exists but not registered. Delete manually: {palette_file}")
        return False

    # Show what will be removed
    print(f"\n=== Palette to Remove ===")
    print(f"ID: {palette_entry['id']}")
    print(f"Name: {palette_entry['name']}")
    print(f"Description: {palette_entry['description']}")
    print(f"File: {palette_file}")

    # Confirm deletion
    confirm = input("\nAre you sure you want to remove this palette? [y/N]: ").strip().lower()

    if confirm != 'y':
        print("Cancelled.")
        return False

    # Remove from manifest
    manifest["palettes"].pop(palette_index)

    # Save updated manifest
    try:
        with open(manifest_path, 'w') as f:
            json.dump(manifest, f, indent=2)
        print(f"\n✓ Removed from manifest: {manifest_path}")
    except Exception as e:
        print(f"✗ Error updating manifest: {e}")
        return False

    # Delete palette file
    try:
        os.remove(palette_file)
        print(f"✓ Deleted palette file: {palette_file}")
    except Exception as e:
        print(f"✗ Error deleting file: {e}")
        print(f"  You may need to delete manually: {palette_file}")
        return False

    print(f"\n✓ Palette '{palette_entry['name']}' removed successfully!")
    return True


def list_palettes(manifest_path):
    """
    List all available palettes.

    Args:
        manifest_path: Path to manifest.json
    """
    try:
        with open(manifest_path, 'r') as f:
            manifest = json.load(f)

        print("\n=== Available Palettes ===")
        for entry in manifest["palettes"]:
            print(f"  {entry['id']:<25} - {entry['name']}")
        print()

    except Exception as e:
        print(f"✗ Error loading manifest: {e}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        print("\nUse 'list' to see all available palettes:")
        print("    python remove-palette.py list")
        sys.exit(1)

    # Determine project root
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    palettes_dir = os.path.join(project_root, 'assets', 'palettes')
    manifest_path = os.path.join(palettes_dir, 'manifest.json')

    palette_id = sys.argv[1].lower()

    # Handle 'list' command
    if palette_id == 'list':
        list_palettes(manifest_path)
        sys.exit(0)

    print(f"\n=== Palettary Palette Remover ===")
    print(f"Palette ID: {palette_id}")

    # Remove the palette
    success = remove_palette(palette_id, palettes_dir, manifest_path)

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
