---
title: "Palettary"
date: "2023-01-12"
link: "https://github.com/datatimp/palettary"
tags: ["design", "figma", "tools", "color", "ui", "ux", "web app"]
---

[<img alt="Palettary logo" width="50%" src="assets/images/palettary-wordmark-brand-primary1a.svg" />](https://github.com/datatimp/palettary/blob/main/assets/images/palettary-wordmark-brand-primary1a.svg)


**A Suite of Design Tools for Figma**

Palettary is a collection of lightweight web apps built to solve common workflow bottlenecks designers face every day. No accounts, no subscriptions, no bloat - just simple tools that do one thing well.

## Apps

### Color Primitive Palettes
Browse, preview, and export curated color palette collections directly to Figma. Similar to [Lospec](https://lospec.com/palette-list) for pixel artists, Palettary provides beautifully named color primitive sets ready for your Variables panel.

- Browse curated palettes with evocative names
- Click any swatch to copy its hex code
- Export to Figma JSON, TXT, or Markdown

#### What Are Color Primitives?

Color primitives are the raw color values in your design system - the actual hex codes organized by hue and shade (e.g., `blue-500: #3B82F6`). They describe *what* a color is, not *how* it's used.

**Semantic tokens**, on the other hand, describe a color's *purpose* (e.g., `color-text-primary`, `color-background-error`). Semantic tokens reference primitives, creating a layer of abstraction that makes your design system flexible and maintainable.

```
Primitive:        blue-600 → #2563EB
                      ↑
Semantic token:   color-link-default → blue-600
```

This separation lets you swap entire color schemes by changing which primitives your semantic tokens point to - without touching every component in your design system.

#### Tips for Designers

1. **Start with Primitives**: Use these palettes as a foundation, then create semantic tokens in Figma
2. **Mix and Match**: You can combine colors from multiple palettes
3. **Test Accessibility**: Always check color contrast ratios for text
4. **Organize in Figma**: After importing, organize variables into collections and modes


### Figma Thumbnail Generator
Create professional file cover thumbnails for your Figma projects in seconds. Help your team navigate large projects by giving every file a consistent, informative cover.

- Customize file name, design system, project type, and description
- Set file status (In Progress, Review, Ready for Dev, Completed, etc.)
- Toggle OS and platform icons
- Export as PNG or SVG


## License

Free to use for personal and commercial projects.

---

**Happy designing!**