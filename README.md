# Palletary

**Curated Color Primitives for Figma**

Palletary is a web app that helps designers organize, sort, and select Color Primitives for Figma. Similar to [Lospec](https://lospec.com/palette-list) for pixel artists, Palletary provides a collection of beautifully named color primitive collections that you can browse, preview, and export directly to Figma's Variables panel.

## Features

- **Browse Color Palettes**: View a curated collection of color primitive sets with evocative names
- **Interactive Preview**: See colors organized by hue with hex codes displayed on each swatch
- **Multiple Export Formats**:
  - **Figma JSON**: Ready to import into Figma's Variables panel
  - **TXT**: Simple text format with color names and hex codes
  - **Markdown**: Formatted documentation with color swatches
- **Click to Copy**: Click any color swatch to copy its hex code to clipboard
- **Fully Static**: No backend required, perfect for GitHub Pages hosting

## How to Use

### Browsing Palettes

1. **View Popular Palettes**: Scroll down to see palette cards showing preview colors
2. **Click a Card**: Click any palette card to view its full color collection
3. **Use the Dropdown**: Select a palette from the dropdown menu at the top

### Viewing Colors

When you select a palette, colors are displayed in rows organized by hue:
- **Primary**: Main brand colors
- **Secondary**: Supporting colors
- **Accent**: Highlight colors (some palettes)
- **Neutral**: Grays and neutrals

Each swatch shows:
- The color itself
- Its variable name (e.g., `primary-500`)
- Its hex code (e.g., `#6366f1`)

### Exporting to Figma

1. Select the palette you want to use
2. Click the **"Figma JSON"** export button
3. Save the JSON file
4. In Figma:
   - Open the Variables panel (right sidebar)
   - Click the menu icon (•••)
   - Select "Import variables"
   - Choose your downloaded JSON file
   - Your color primitives are now ready to use!

### Other Export Formats

- **TXT**: Plain text format, great for documentation or sharing
- **MD**: Markdown format with tables, perfect for project documentation

## Deploying to GitHub Pages

Since you already have a GitHub Pages site, here's how to add Palletary:

### Option 1: As Your Main Site

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Palletary color primitives app"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository settings
   - Scroll to "Pages" section
   - Under "Source", select your main branch
   - Click "Save"
   - Your site will be live at `https://yourusername.github.io/palettary`

### Option 2: As a Subdirectory

If you want to keep your existing homepage and add Palletary as a section:

1. Create a `palettary` folder in your existing GitHub Pages repo
2. Copy all Palletary files into that folder
3. Access it at `https://yourusername.github.io/palettary/`

## Adding Your Own Palettes

To add custom color primitive collections, edit `palettes.js`:

```javascript
{
    id: 'your-palette-id',
    name: 'Your Palette Name',
    description: 'A description that evokes the feeling of your colors',
    colors: {
        primary: [
            { name: 'primary-50', hex: '#f0f9ff' },
            { name: 'primary-100', hex: '#e0f2fe' },
            // ... more shades
        ],
        secondary: [
            { name: 'secondary-50', hex: '#fdf2f8' },
            // ... more shades
        ],
        neutral: [
            { name: 'neutral-50', hex: '#fafafa' },
            // ... more shades
        ],
    },
}
```

### Palette Naming Tips

Choose names that evoke feelings or imagery related to your colors:
- ✅ "Midnight Canvas", "Ocean Breeze", "Sunset Glow"
- ❌ "Color Primitives", "UI Colors", "Brand Palette"

## File Structure

```
palettary/
├── index.html          # Main HTML structure
├── styles.css          # All styling
├── app.js              # Application logic and exports
├── palettes.js         # Palette data
└── README.md           # This file
```

## Technology Stack

- **Pure HTML/CSS/JavaScript**: No frameworks, no build process
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern CSS**: Uses CSS Grid, Flexbox, and CSS variables
- **ES6+ JavaScript**: Clean, modern JavaScript

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Customization

### Changing Colors

Edit CSS variables in `styles.css`:

```css
:root {
    --primary-color: #6366f1;
    --primary-hover: #4f46e5;
    /* ... more variables */
}
```

### Modifying Layout

All layout styles are in `styles.css`. The design uses:
- CSS Grid for palette cards
- Flexbox for color swatches
- Responsive breakpoints at 768px

## Tips for Designers

1. **Start with Primitives**: Use these palettes as a foundation, then create semantic tokens in Figma
2. **Mix and Match**: You can combine colors from multiple palettes
3. **Test Accessibility**: Always check color contrast ratios for text
4. **Organize in Figma**: After importing, organize variables into collections and modes

## License

Free to use for personal and commercial projects.

---

**Happy designing! 🎨**
