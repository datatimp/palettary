// App State
let currentPalette = null;
let paletteManifest = null;
let paletteCache = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadManifest();
    populateDropdown();
    displayPaletteCards();
    setupEventListeners();
});

// Load the palette manifest
async function loadManifest() {
    try {
        const response = await fetch('assets/palettes/manifest.json');
        const data = await response.json();
        paletteManifest = data.palettes;
    } catch (error) {
        console.error('Error loading palette manifest:', error);
        paletteManifest = [];
    }
}

// Load a specific palette from JSON file
async function loadPalette(paletteId) {
    // Check cache first
    if (paletteCache[paletteId]) {
        return paletteCache[paletteId];
    }

    try {
        const response = await fetch(`assets/palettes/${paletteId}.json`);
        const palette = await response.json();
        paletteCache[paletteId] = palette;
        return palette;
    } catch (error) {
        console.error(`Error loading palette ${paletteId}:`, error);
        return null;
    }
}

// Populate the palette dropdown
function populateDropdown() {
    const dropdown = document.getElementById('palette-select');

    if (!paletteManifest) return;

    // Add Random option
    const randomOption = document.createElement('option');
    randomOption.value = 'random';
    randomOption.textContent = '🎲 Random';
    dropdown.appendChild(randomOption);

    // Add separator
    const separator = document.createElement('option');
    separator.disabled = true;
    separator.textContent = '──────────';
    dropdown.appendChild(separator);

    // Sort palettes alphabetically by name
    const sortedPalettes = [...paletteManifest].sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    // Add all palettes
    sortedPalettes.forEach(palette => {
        const option = document.createElement('option');
        option.value = palette.id;
        option.textContent = palette.name;
        dropdown.appendChild(option);
    });
}

// Display palette cards in the gallery
function displayPaletteCards() {
    const cardsContainer = document.getElementById('palette-cards');

    if (!paletteManifest) return;

    // Sort palettes by dateAdded in descending order (newest first)
    const sortedPalettes = [...paletteManifest].sort((a, b) => {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    sortedPalettes.forEach(async (paletteInfo) => {
        const card = await createPaletteCard(paletteInfo);
        cardsContainer.appendChild(card);
    });
}

// Create a palette card element
async function createPaletteCard(paletteInfo) {
    const card = document.createElement('div');
    card.className = 'palette-card';
    card.dataset.paletteId = paletteInfo.id;
    card.onclick = () => selectPalette(paletteInfo.id);

    // Load the palette to get preview colors
    const palette = await loadPalette(paletteInfo.id);

    if (!palette) {
        // Fallback if palette fails to load
        card.innerHTML = `
            <div class="palette-card-info">
                <h3 class="palette-card-name">${paletteInfo.name}</h3>
                <p class="palette-card-description">${paletteInfo.description}</p>
            </div>
        `;
        return card;
    }

    // Get up to 6 colors for preview, excluding neutral if there are 6+ other hues
    const hues = Object.keys(palette.colors);
    const nonNeutralHues = hues.filter(hue => hue !== 'neutral');

    // Decide which hues to use for preview
    let huesToDisplay;
    if (nonNeutralHues.length >= 6) {
        // Skip neutral if we have 6+ other hues
        huesToDisplay = nonNeutralHues.slice(0, 6);
    } else {
        // Use all hues up to 6
        huesToDisplay = hues.slice(0, 6);
    }

    const previewColors = [];
    huesToDisplay.forEach(hueName => {
        const hueColors = palette.colors[hueName];
        const midIndex = Math.floor(hueColors.length / 2);
        previewColors.push(hueColors[midIndex].hex);
    });

    const colorsHTML = previewColors.map(color =>
        `<div class="palette-card-color" style="background-color: ${color};"></div>`
    ).join('');

    const colorCount = Object.values(palette.colors).reduce((sum, hue) => sum + hue.length, 0);

    card.innerHTML = `
        <div class="palette-card-colors">
            ${colorsHTML}
        </div>
        <div class="palette-card-info">
            <h3 class="palette-card-name">${palette.name}</h3>
            <p class="palette-card-description">${palette.description}</p>
            <p class="palette-card-meta">${colorCount} colors • ${Object.keys(palette.colors).length} hues</p>
        </div>
    `;

    return card;
}

// Setup event listeners
function setupEventListeners() {
    // Dropdown change listener
    const paletteSelect = document.getElementById('palette-select');
    if (paletteSelect) {
        paletteSelect.addEventListener('change', (e) => {
            if (e.target.value) {
                if (e.target.value === 'random') {
                    // Select a random palette from the manifest
                    const randomIndex = Math.floor(Math.random() * paletteManifest.length);
                    const randomPalette = paletteManifest[randomIndex];
                    selectPalette(randomPalette.id);
                } else {
                    selectPalette(e.target.value);
                }
            }
        });
    }

    // Palette name click to collapse
    document.getElementById('palette-name').addEventListener('click', () => {
        if (currentPalette) {
            document.getElementById('palette-display').style.display = 'none';
            currentPalette = null;
            document.getElementById('palette-select').value = '';
            // Show all palette cards again
            document.querySelectorAll('.palette-card').forEach(card => {
                card.style.display = '';
            });
            // Scroll back to selector
            document.querySelector('.selector-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // Export button listeners
    document.querySelectorAll('.export-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const format = e.currentTarget.dataset.format;
            if (currentPalette) {
                exportPalette(currentPalette, format);
            }
        });
    });
}

// Select and display a palette
async function selectPalette(paletteId) {
    const palette = await loadPalette(paletteId);
    if (!palette) return;

    // Show the previously selected palette's card (if any)
    if (currentPalette) {
        const previousCard = document.querySelector(`.palette-card[data-palette-id="${currentPalette.id}"]`);
        if (previousCard) {
            previousCard.style.display = '';
        }
    }

    currentPalette = palette;

    // Update dropdown
    document.getElementById('palette-select').value = paletteId;

    // Update display
    document.getElementById('palette-name').textContent = palette.name;
    document.getElementById('palette-description').textContent = palette.description;

    // Update contributor info
    const contributorEl = document.getElementById('palette-contributor');
    if (palette.contributor_handle) {
        if (palette.contributor_link) {
            contributorEl.innerHTML = `Contributed by <a href="${palette.contributor_link}" class="contributor-name" target="_blank" rel="noopener noreferrer">${palette.contributor_handle}</a>`;
        } else {
            contributorEl.innerHTML = `Contributed by <span class="contributor-name">${palette.contributor_handle}</span>`;
        }
    } else {
        contributorEl.innerHTML = '';
    }

    // Display color swatches
    displayColorSwatches(palette);

    // Show the palette display section
    const paletteDisplay = document.getElementById('palette-display');
    paletteDisplay.style.display = 'block';

    // Hide the selected palette's card from the gallery
    const selectedCard = document.querySelector(`.palette-card[data-palette-id="${paletteId}"]`);
    if (selectedCard) {
        selectedCard.style.display = 'none';
    }

    // Scroll to palette display
    paletteDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Display color swatches organized by hue
function displayColorSwatches(palette) {
    const swatchesContainer = document.getElementById('color-swatches');
    swatchesContainer.innerHTML = '';

    Object.entries(palette.colors).forEach(([hueName, colors]) => {
        const hueRow = document.createElement('div');
        hueRow.className = 'hue-row';

        const label = document.createElement('div');
        label.className = 'hue-label';
        label.textContent = hueName;

        const swatchesWrapper = document.createElement('div');
        swatchesWrapper.className = 'swatches-container';

        colors.forEach(color => {
            const swatch = createSwatch(color);
            swatchesWrapper.appendChild(swatch);
        });

        hueRow.appendChild(label);
        hueRow.appendChild(swatchesWrapper);
        swatchesContainer.appendChild(hueRow);
    });
}

// Create a color swatch element
function createSwatch(color) {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.onclick = () => copyToClipboard(color.hex);

    swatch.innerHTML = `
        <div class="swatch-color" style="background-color: ${color.hex};"></div>
        <div class="swatch-info">
            <div class="swatch-name">${color.name}</div>
            <div class="swatch-hex">${color.hex}</div>
        </div>
    `;

    return swatch;
}



// Export palette in different formats
function exportPalette(palette, format) {
    let content, filename, mimeType;

    switch (format) {
        case 'json':
            content = generateFigmaJSON(palette);
            filename = `${palette.id}-figma.json`;
            mimeType = 'application/json';
            break;
        case 'css':
            content = generateCSS(palette);
            filename = `${palette.id}.css`;
            mimeType = 'text/css';
            break;
        case 'txt':
            content = generateTXT(palette);
            filename = `${palette.id}.txt`;
            mimeType = 'text/plain';
            break;
    }

    downloadFile(content, filename, mimeType);
    showNotification(`Exported ${palette.name} as ${format.toUpperCase()}`);
}

// Generate Figma-compatible JSON for Variables
function generateFigmaJSON(palette) {
    const figmaData = {};

    // Convert palette colors to Figma variable format
    Object.entries(palette.colors).forEach(([hueName, colors]) => {
        // Capitalize the hue name for the group (e.g., "primary" -> "Primary")
        const groupName = hueName.charAt(0).toUpperCase() + hueName.slice(1);

        figmaData[groupName] = {};

        colors.forEach(color => {
            // Extract shade number from color name (e.g., "primary-50" -> "50")
            const shadeMatch = color.name.match(/-(\d+)$/);
            const shade = shadeMatch ? shadeMatch[1] : '500';

            // Convert hex to RGB components (0-1 range)
            const rgb = hexToRgb(color.hex);

            figmaData[groupName][shade] = {
                "$type": "color",
                "$value": {
                    "colorSpace": "srgb",
                    "components": [
                        rgb.r / 255,
                        rgb.g / 255,
                        rgb.b / 255
                    ],
                    "alpha": 1,
                    "hex": color.hex.toUpperCase()
                },
                "$extensions": {
                    "com.figma.variableId": `VariableID:${groupName}:${shade}`,
                    "com.figma.scopes": ["ALL_SCOPES"],
                    "com.figma.codeSyntax": {
                        "WEB": `--color-${hueName}-${shade}`
                    }
                }
            };
        });
    });

    return JSON.stringify(figmaData, null, 2);
}

// Generate TXT format
function generateTXT(palette) {
    let content = `${palette.name}\n`;
    content += `${palette.description}\n`;
    content += `${'='.repeat(50)}\n\n`;

    Object.entries(palette.colors).forEach(([hueName, colors]) => {
        content += `${hueName.toUpperCase()}\n`;
        content += `${'-'.repeat(30)}\n`;
        colors.forEach(color => {
            content += `${color.name.padEnd(20)} ${color.hex}\n`;
        });
        content += '\n';
    });

    return content;
}

// Generate CSS format with CSS custom properties
function generateCSS(palette) {
    let content = `/* ${palette.name} */\n`;
    content += `/* ${palette.description} */\n`;
    content += `/* Exported from Palettary on ${new Date().toLocaleDateString()} */\n\n`;
    content += `:root {\n`;

    // Generate CSS custom properties in --color-[group]-[number] format
    Object.entries(palette.colors).forEach(([hueName, colors]) => {
        content += `  /* ${hueName.charAt(0).toUpperCase() + hueName.slice(1)} */\n`;
        colors.forEach(color => {
            // Extract shade number from color name (e.g., "primary-50" -> "50")
            const shadeMatch = color.name.match(/-(\d+)$/);
            const shade = shadeMatch ? shadeMatch[1] : '500';

            content += `  --color-${hueName}-${shade}: ${color.hex};\n`;
        });
        content += '\n';
    });

    content += `}\n`;

    return content;
}

// Convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

// Download file
function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
