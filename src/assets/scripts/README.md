# Palettary Scripts

Utility scripts for managing Palettary palettes.

## Scripts Overview

- **import-palette.py** - Import palettes from Figma JSON or CSS files
- **remove-palette.py** - Remove palettes from the system

---

## Import Palette Script

Convert external palette files (Figma JSON or CSS) to Palettary's internal format.

### Requirements

- Python 3.6 or higher (no additional packages needed)

### Usage

```bash
# From the project root directory:
python src/assets/scripts/import-palette.py <format> <input-file>
```

### Supported Formats

**1. Figma JSON** (`.tokens.json` or `.json`)
- Figma's Design Tokens format
- Preserves all color groups and shades

```bash
python ~/path/my-file.tokens.json
```

**2. CSS Custom Properties** (`.css`)
- CSS files with `--{group}-{shade}: #HEX;` format
- Supports both simple `:root` and themed `:root[data-theme="light"]`
- **Light theme only**: Automatically extracts light theme and ignores dark theme

```bash
python ~/path/my-file.css
```

### What the Script Does

1. **Reads** the input file in the specified format
2. **Prompts** for palette metadata:
   - Palette ID (lowercase-with-dashes)
   - Palette Name
   - Description
   - Date Added (defaults to today)
3. **Converts** to Palettary's internal format (preserves all color groups)
4. **Saves** to `assets/palettes/{id}.json`
5. **Updates** `assets/palettes/manifest.json` automatically

### Important Notes

- **Preserves Structure**: All color groups from the source file are preserved
- **No Compression**: Groups are NOT mapped to standard Primary/Secondary/Accent
- **Overwrites**: If a palette with the same ID exists, it will be updated
- **Validation**: Shows a preview before saving

### What is Palette ID?

**Palette ID** is a unique, URL-friendly identifier for your palette:
- **Format**: lowercase-with-dashes (e.g., `my-awesome-palette`)
- **Used for**: Filenames, internal references, and URLs
- **Must be unique**: Each palette needs a different ID
- **Examples**:
  - "Midnight Canvas" → `midnight-canvas`
  - "Ocean Breeze" → `ocean-breeze`
  - "Japanese Woodblock" → `japanese-woodblock`

### Example Session

```bash
$ python src/assets/scripts/import-palette.py figma path/to/your-palette.tokens.json

=== Palettary Palette Importer ===
Input file: path/to/your-palette.tokens.json
Format: FIGMA

=== Palette Metadata ===
Palette ID (lowercase-with-dashes): my-palette-id
Palette Name: My Beautiful Palette
Description: A collection of harmonious colors for modern interfaces
Use today's date (2026-01-02)? [Y/n]: y

=== Palette Preview ===
ID: my-palette-id
Name: My Beautiful Palette
Description: A collection of harmonious colors for modern interfaces
Color groups: neutral, primary, secondary, accent
Total colors: 45

Save this palette? [Y/n]: y

✓ Palette saved to: assets/palettes/my-palette-id.json
✓ Added new palette 'my-palette-id' to manifest
✓ Manifest updated: assets/palettes/manifest.json

✓ Import complete!

Your palette 'My Beautiful Palette' is now available in Palettary.
```

### Troubleshooting

**"File not found"**
- Make sure you're running from the project root directory
- Check the file path is correct

**"Format must be 'figma' or 'css'"**
- First argument must be either `figma` or `css`

**"Error parsing file"**
- Ensure the file is valid JSON (for Figma) or CSS
- Check the file follows the expected format

---

## Remove Palette Script

Safely remove a palette from the system by deleting its file and updating the manifest.

### Usage

```bash
# Remove a specific palette
python src/assets/scripts/remove-palette.py <palette-id>

# List all available palettes
python src/assets/scripts/remove-palette.py list
```

### Examples

**Remove a palette:**
```bash
$ python src/assets/scripts/remove-palette.py japanese-woodblock

=== Palettary Palette Remover ===
Palette ID: japanese-woodblock

=== Palette to Remove ===
ID: japanese-woodblock
Name: Japanese Woodblock
Description: A collection of colors based on muted tones from Japanese woodblock prints
File: assets/palettes/japanese-woodblock.json

Are you sure you want to remove this palette? [y/N]: y

✓ Removed from manifest: assets/palettes/manifest.json
✓ Deleted palette file: assets/palettes/japanese-woodblock.json

✓ Palette 'Japanese Woodblock' removed successfully!
```

**List available palettes:**
```bash
$ python src/assets/scripts/remove-palette.py list

=== Available Palettes ===
  midnight-canvas           - Midnight Canvas
  ocean-breeze              - Ocean Breeze
  sunset-glow               - Sunset Glow
  forest-whisper            - Forest Whisper
  cherry-blossom            - Cherry Blossom
  arctic-aurora             - Arctic Aurora
```

### What It Does

1. **Validates** the palette exists (checks both file and manifest)
2. **Shows preview** of what will be removed
3. **Asks confirmation** before deleting
4. **Updates manifest** by removing the palette entry
5. **Deletes file** from `assets/palettes/`

### Safety Features

- **Confirmation required** - Won't delete without explicit 'y' confirmation
- **Shows preview** - See exactly what will be removed before deletion
- **Validation** - Checks if palette exists before attempting removal
- **Error handling** - Clear error messages if something goes wrong
