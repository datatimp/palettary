#!/usr/bin/env python3
"""
Palette Import Script for Palettary

Converts Figma JSON or CSS files to Palettary's internal palette format.
Preserves all color groups and structure from the source file.

Usage:
    python import-palette.py figma <input-file>
    python import-palette.py css <input-file>

Example:
    python src/assets/scripts/import-palette.py figma assets/uploads/woodblock-japanese.tokens.json
"""

import json
import sys
import os
import re
from datetime import date


def convert_figma_to_palette(figma_data, metadata):
    """
    Convert Figma JSON format to Palettary internal format.
    Preserves all color groups exactly as they appear in the source.

    Handles two Figma JSON structures:
    1. Simple nested structure: {"Neutral": {"50": {...}, "100": {...}}}
    2. Complex structure with -shades and -alpha variants

    Args:
        figma_data: Parsed Figma JSON data
        metadata: Dict with id, name, description

    Returns:
        Dict in Palettary palette format
    """
    palette = {
        "id": metadata["id"],
        "name": metadata["name"],
        "description": metadata["description"],
        "contributor_handle": metadata.get("contributor_handle", ""),
        "contributor_link": metadata.get("contributor_link", ""),
        "colors": {}
    }

    # Process each color group
    for group_name, group_data in figma_data.items():
        # Skip the $extensions key
        if group_name.startswith("$"):
            continue

        # Skip alpha groups (e.g., "text-alpha", "primary-alpha")
        if group_name.lower().endswith("-alpha"):
            continue

        # Check if this is a single color object (has $value directly)
        # These are reference colors, not shade groups, so skip them
        if isinstance(group_data, dict) and "$value" in group_data:
            continue

        # Convert group name to lowercase
        hue_name = group_name.lower()

        # Remove "-shades" suffix if present (e.g., "text-shades" -> "text")
        if hue_name.endswith("-shades"):
            hue_name = hue_name[:-7]  # Remove last 7 characters ("-shades")

        palette["colors"][hue_name] = []

        # Process each shade in the group
        for shade_num, color_data in group_data.items():
            if not isinstance(color_data, dict) or "$value" not in color_data:
                continue

            hex_value = color_data["$value"]["hex"]

            # Extract just the number from shade_num
            # In case shade_num is like "text-5" instead of just "5"
            if shade_num.startswith(f"{hue_name}-"):
                # Remove the hue_name prefix (e.g., "text-5" -> "5")
                shade_only = shade_num[len(hue_name) + 1:]
            else:
                # Use shade_num as-is if it doesn't have the prefix
                shade_only = shade_num

            # Create color entry with our naming convention
            color_entry = {
                "name": f"{hue_name}-{shade_only}",
                "hex": hex_value
            }

            palette["colors"][hue_name].append(color_entry)

    return palette


def convert_css_to_palette(css_content, metadata):
    """
    Convert CSS custom properties to Palettary internal format.
    Supports both simple :root and themed :root[data-theme="light"].
    Only extracts light theme colors (ignores dark theme).

    Args:
        css_content: String content of CSS file
        metadata: Dict with id, name, description

    Returns:
        Dict in Palettary palette format
    """
    palette = {
        "id": metadata["id"],
        "name": metadata["name"],
        "description": metadata["description"],
        "contributor_handle": metadata.get("contributor_handle", ""),
        "contributor_link": metadata.get("contributor_link", ""),
        "colors": {}
    }

    # Check if CSS has themed sections
    has_light_theme = 'data-theme="light"' in css_content or "data-theme='light'" in css_content
    has_dark_theme = 'data-theme="dark"' in css_content or "data-theme='dark'" in css_content

    # Extract only the light theme section if themes exist
    if has_light_theme:
        # Extract content between :root[data-theme="light"] { and its closing }
        light_pattern = r':root\[data-theme=["\']light["\']\]\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}'
        light_match = re.search(light_pattern, css_content, re.DOTALL)

        if light_match:
            css_to_parse = light_match.group(1)
            print(f"\nℹ Found themed CSS - extracting light theme only (ignoring dark theme)")
        else:
            css_to_parse = css_content
    else:
        # Use entire content for simple :root without themes
        css_to_parse = css_content

    # Pattern to match CSS custom properties
    # Matches: --text-100: #HEX, --background-500: #HEX, etc.
    pattern = r'--([a-zA-Z]+)-(\d+)\s*:\s*(#[0-9A-Fa-f]{6})'

    matches = re.findall(pattern, css_to_parse)

    if not matches:
        print(f"\n⚠ Warning: No color variables found in the format --group-shade: #HEX")
        print(f"   Make sure your CSS uses variables like: --primary-500: #ABC123;")

    # Group colors by hue
    for hue_name, shade_num, hex_value in matches:
        hue_name = hue_name.lower()

        if hue_name not in palette["colors"]:
            palette["colors"][hue_name] = []

        color_entry = {
            "name": f"{hue_name}-{shade_num}",
            "hex": hex_value.upper()
        }

        palette["colors"][hue_name].append(color_entry)

    # Sort colors within each hue by shade number
    for hue_name in palette["colors"]:
        palette["colors"][hue_name].sort(
            key=lambda c: int(c["name"].split("-")[-1])
        )

    return palette


def prompt_metadata():
    """
    Prompt user for palette metadata.

    Returns:
        Dict with id, name, description, dateAdded
    """
    print("\n=== Palette Metadata ===")

    palette_id = input("Palette ID (lowercase-with-dashes): ").strip()
    name = input("Palette Name: ").strip()
    description = input("Description: ").strip()

    # Offer to use today's date or custom date
    use_today = input(f"Use today's date ({date.today()})? [Y/n]: ").strip().lower()

    if use_today == 'n':
        date_added = input("Date (YYYY-MM-DD): ").strip()
    else:
        date_added = str(date.today())

    contributor_handle = input("Contributor Handle (e.g. datatimp): ").strip()
    contributor_link = input("Contributor Link (optional URL): ").strip()

    return {
        "id": palette_id,
        "name": name,
        "description": description,
        "dateAdded": date_added,
        "contributor_handle": contributor_handle,
        "contributor_link": contributor_link
    }


def save_palette(palette, output_dir):
    """
    Save palette to JSON file.

    Args:
        palette: Palette dict
        output_dir: Directory to save palette file
    """
    filename = f"{palette['id']}.json"
    filepath = os.path.join(output_dir, filename)

    with open(filepath, 'w') as f:
        json.dump(palette, f, indent=2)

    print(f"\n✓ Palette saved to: {filepath}")
    return filename


def update_manifest(metadata, manifest_path):
    """
    Update the manifest.json file with new palette entry.

    Args:
        metadata: Dict with id, name, description, dateAdded
        manifest_path: Path to manifest.json
    """
    # Load existing manifest
    with open(manifest_path, 'r') as f:
        manifest = json.load(f)

    # Create new palette entry
    new_entry = {
        "id": metadata["id"],
        "name": metadata["name"],
        "description": metadata["description"],
        "file": f"{metadata['id']}.json",
        "dateAdded": metadata["dateAdded"]
    }

    # Check if palette already exists
    existing_index = None
    for i, palette in enumerate(manifest["palettes"]):
        if palette["id"] == metadata["id"]:
            existing_index = i
            break

    if existing_index is not None:
        # Update existing entry
        manifest["palettes"][existing_index] = new_entry
        print(f"\n✓ Updated existing palette '{metadata['id']}' in manifest")
    else:
        # Add new entry
        manifest["palettes"].append(new_entry)
        print(f"\n✓ Added new palette '{metadata['id']}' to manifest")

    # Save updated manifest
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)

    print(f"✓ Manifest updated: {manifest_path}")


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)

    format_type = sys.argv[1].lower()
    input_file = sys.argv[2]

    if format_type not in ['figma', 'css']:
        print("Error: Format must be 'figma' or 'css'")
        print(__doc__)
        sys.exit(1)

    if not os.path.exists(input_file):
        print(f"Error: File not found: {input_file}")
        sys.exit(1)

    # Determine project root (go up from assets/scripts to project root)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(os.path.dirname(script_dir))
    palettes_dir = os.path.join(project_root, 'assets', 'palettes')
    manifest_path = os.path.join(palettes_dir, 'manifest.json')

    print(f"\n=== Palettary Palette Importer ===")
    print(f"Input file: {input_file}")
    print(f"Format: {format_type.upper()}")

    # Get metadata from user
    metadata = prompt_metadata()

    # Convert based on format
    if format_type == 'figma':
        with open(input_file, 'r') as f:
            figma_data = json.load(f)
        palette = convert_figma_to_palette(figma_data, metadata)
    else:  # css
        with open(input_file, 'r') as f:
            css_content = f.read()
        palette = convert_css_to_palette(css_content, metadata)

    # Show preview
    print(f"\n=== Palette Preview ===")
    print(f"ID: {palette['id']}")
    print(f"Name: {palette['name']}")
    print(f"Description: {palette['description']}")
    print(f"Color groups: {', '.join(palette['colors'].keys())}")

    total_colors = sum(len(colors) for colors in palette['colors'].values())
    print(f"Total colors: {total_colors}")

    # Confirm before saving
    confirm = input("\nSave this palette? [Y/n]: ").strip().lower()
    if confirm == 'n':
        print("Cancelled.")
        sys.exit(0)

    # Save palette and update manifest
    save_palette(palette, palettes_dir)
    update_manifest(metadata, manifest_path)

    print("\n✓ Import complete!")
    print(f"\nYour palette '{palette['name']}' is now available in Palettary.")


if __name__ == "__main__":
    main()
