<div align="center">
<a href="https://datatimp.github.io/palettary" target="_blank">
  <img src="https://raw.githubusercontent.com/datatimp/palettary/main/src/assets/images/palettary-wordmark-logo.svg" width="600" alt="Palettary Logo" />
</a>
</div>

<br />

---

<div align="center">
<br />
 <p>
    <strong>Helpful Design Tools for Figma</strong><br />
    No accounts. No subscriptions.
  </p>

  ![Static Badge](https://img.shields.io/badge/License-MIT-blue)
 ![Static Badge](https://img.shields.io/badge/Status-Active-brightgreen)
 ![Static Badge](https://img.shields.io/badge/Figma-Compatible-purple?logo=figma&logoColor=white)

<br />
</div>

<div align="center">
<img src="https://raw.githubusercontent.com/datatimp/palettary/main/src/assets/images/palettary-tour-900x600.avif" width="800" alt="Palettary AVIF" />
</div>

## Table of Contents
1. [Available Apps](#available-apps)
2. [What are color primitives?](#what-are-color-primitives)
3. [Why generate thumbnails?](#why-generate-thumbnails)
4. [Contributions](#contributions)

<br>

## Available Apps

<div align="center">

  <h3>🎨 Color Primitives</h3>
  <p>Browse, preview, and export curated color palette collections directly to Figma. Perfect for setting up your design system's foundation.</p>
  
  <img src="src/assets/images/palettary-palette-screen.png" width="60%">
  <br/>
  
  <a href="https://datatimp.github.io/palettary/">
    <img src="https://img.shields.io/badge/Launch_App-Color_Primitive_Palettes-blue" alt="Launch Color App" />
  </a>

  <div align="left" style="max-width: 400px;">
    <ul>
      <li>Browse palettes with evocative names</li>
      <li>One-click hex copy</li>
      <li>Export to Figma JSON, TXT, or MD</li>
    </ul>
  </div>

  <br/><hr/><br/>

  <h3>🖼️ Thumbnail Generator</h3>
  <p>Create professional file cover thumbnails for your Figma projects in seconds. Keep your team organized with consistent visuals.</p>
  
  <img src="src/assets/images/palettary-thumbnail-gen-screen.png" width="60%">
  <br/>

  <a href="https://datatimp.github.io/palettary/figthumb.html/">
    <img src="https://img.shields.io/badge/Launch_App-Thumbnail_Generator-purple" alt="Launch Thumbnail App" />
  </a>

  <div align="left" style="max-width: 400px;">
    <ul>
      <li>Customizable project status & types</li>
      <li>Toggle platform icons (iOS, Android, etc.)</li>
      <li>Export as PNG or SVG</li>
    </ul>
  </div>

</div>

<br />

## What are Color Primitives?

Color primitives are the **raw color values** in your design system (e.g., `blue-500: #2563EB`). They describe what a color *is*.

<br />

<div align="center">

<figure>
  <img src="src/assets/images/figma-variables.png" alt="Figma variables panel showing color primitives" width="75%">
  <br />
  <figcaption align="center"><i>Figure 1: Figma variables panel showing color primitives.</i></figcaption>
</figure>

</div>

<br />
<br />

**Semantic tokens**, on the other hand, describe a color's *purpose* (e.g., `color-text-primary`). By referencing primitives, you create a flexible abstraction layer.

```
Primitive:        blue-600 → #2563EB
                      ↑
Semantic token:   color-link-default → blue-600
```

1.  **Start with Primitives**: Use a palette from Palettary as your foundation.
2.  **Mix & Match**: Once ported into Figma, alter colors as you see fit.
3.  **Create Semantics**: Create semantic tokens and map them to the corresponding primitives. 

This [article](https://medium.com/@tarun_design00/color-system-color-theory-primitives-semantics-tokens-567f64368d30) on Medium is a terrific resource from which to learn more. 

<br />

## Why generate thumbnails?

Figma's file browser can quickly become cluttered. Thumbnails give your team a visual system to scan and identify files instantly.

With Palettary's thumbnail generator, you can:

- **See status at a glance**: Know immediately if a file is `WIP`, `In Review`, or `Ready for Dev` without opening it.
- **Quickly know categorization**: Distinguish between `Design`, `Prototypes`, and `Specs` with color-coded covers.
- **Understand project context**: Ensure every file clearly states which project or design system it belongs to.


<br />

## Contributing
I want these tools to be helpful to as many as possible. If you'd like to submit a palette, or an idea, use [this Google Form](https://forms.gle/xqpEMTbqkQMFyp1v6). For bug reports, submit to this repository.