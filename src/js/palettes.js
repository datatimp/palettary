// App State
let currentPalette = null;
let paletteManifest = null;
let paletteCache = {};

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadManifest();
    populateDropdown();
    await displayPaletteCards();
    setupEventListeners();
    initHeroParallax();
    initHeroAnimation();

    // Check for palette ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const paletteId = urlParams.get('palette');

    if (paletteId) {
        // Wait for everything to be ready before selecting
        selectPalette(paletteId);
    }
});

// Hero parallax - content scrolls faster (growing gap), image fades
function initHeroParallax() {
    const heroImage = document.querySelector('.hero-image');
    const heroContent = document.querySelector('.hero-content');

    if (!heroImage || !heroContent) return;

    const BREAKPOINT = 968;
    const SCROLL_MULTIPLIER = 0.3;
    const MIN_OPACITY = 0.2;

    let lastScrollY = 0;

    function resetParallax() {
        heroContent.style.transform = '';
        heroImage.style.opacity = '';
        lastScrollY = 0;
    }

    function updateParallax() {
        if (window.innerWidth > BREAKPOINT) {
            resetParallax();
            return;
        }

        const scrollY = window.scrollY;
        const imageHeight = heroImage.offsetHeight;
        const scrollingUp = scrollY < lastScrollY;

        // Content scrolls faster - creates growing gap effect
        const contentOffset = scrollY * SCROLL_MULTIPLIER;
        heroContent.style.transform = `translateY(-${contentOffset}px)`;

        // Image fades as content approaches
        // Instant snap to full opacity when scrolling up
        if (scrollingUp) {
            heroImage.style.opacity = 1;
        } else {
            const fadeProgress = Math.min(1, scrollY / imageHeight);
            heroImage.style.opacity = 1 - (1 - MIN_OPACITY) * fadeProgress;
        }

        lastScrollY = scrollY;
    }

    // Handle scroll-to-top links
    document.querySelectorAll('.scroll-to-top, a[href="#top"]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            resetParallax();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });

    window.addEventListener('scroll', updateParallax, { passive: true });
    window.addEventListener('resize', updateParallax);

    updateParallax();
}

// Hero Rive animation - plays once on first visit, then shows static PNG
function initHeroAnimation() {
    const heroImage = document.querySelector('.hero-image');
    const canvas = document.getElementById('rive-canvas');

    if (!heroImage || !canvas) return;

    const playRive = () => {
        if (typeof rive === 'undefined') return;

        heroImage.classList.add('rive-active');

        // Dynamically get the layout depending on the exact CSS media query
        const getLayoutOptions = () => ({
            fit: window.matchMedia('(max-width: 968px)').matches ? 'cover' : 'contain',
            alignment: 'center'
        });

        // Wait one frame so the browser flexbox completes its relative layout before reading dimensions
        requestAnimationFrame(() => {
            try {
                const r = new rive.Rive({
                    src: 'src/assets/images/hero-graphic.riv',
                    canvas: canvas,
                    autoplay: true,
                    layout: new rive.Layout(getLayoutOptions()),
                    onStop: () => {
                        localStorage.setItem('palettary_hero_seen', 'true');
                        heroImage.classList.remove('rive-active');
                        window.removeEventListener('resize', resizeHandler);
                    },
                    onLoad: () => {
                        r.resizeDrawingSurfaceToCanvas();
                    },
                    onLoadError: () => {
                        heroImage.classList.remove('rive-active');
                    }
                });

                // Keep the Rive layout in sync with CSS Media queries if the user dimensions change
                const resizeHandler = () => {
                    if (r) {
                        r.layout = new rive.Layout(getLayoutOptions());
                        r.resizeDrawingSurfaceToCanvas();
                    }
                };
                window.addEventListener('resize', resizeHandler);

            } catch (e) {
                heroImage.classList.remove('rive-active');
            }
        });
    };

    // Auto-play on first visit
    if (!localStorage.getItem('palettary_hero_seen')) {
        playRive();
    }

    // Manual replay on click
    heroImage.addEventListener('click', () => {
        playRive();
    });
}

// Load the palette manifest
async function loadManifest() {
    try {
        const response = await fetch('src/assets/palettes/manifest.json');
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
        const response = await fetch(`src/assets/palettes/${paletteId}.json`);
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
// Display palette cards in the gallery
async function displayPaletteCards() {
    const cardsContainer = document.getElementById('palette-cards');

    if (!paletteManifest) return;

    // Sort palettes by dateAdded in descending order (newest first)
    const sortedPalettes = [...paletteManifest].sort((a, b) => {
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    // Create all cards in parallel but maintain order
    const cardPromises = sortedPalettes.map(paletteInfo => createPaletteCard(paletteInfo));
    const cards = await Promise.all(cardPromises);

    // Append cards in valid order
    cardsContainer.innerHTML = ''; // Clear existing content
    cards.forEach(card => {
        if (card) cardsContainer.appendChild(card);
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

    // Get up to 6 colors for preview
    const hues = Object.keys(palette.colors);
    const nonNeutralHues = hues.filter(hue => hue !== 'neutral');

    const previewColors = [];

    // Special handling for single-hue palettes: show multiple shades
    if (hues.length === 1) {
        const hueColors = palette.colors[hues[0]];

        // Filter out white/near-white colors (luminance > 0.95)
        const nonWhiteColors = hueColors.filter(color => {
            const rgb = hexToRgb(color.hex);
            if (!rgb) return true;
            const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
            return luminance <= 0.95;
        });

        // Use non-white colors if we have enough, otherwise use all colors
        const colorsToSample = nonWhiteColors.length >= 6 ? nonWhiteColors : hueColors;

        // Pick up to 6 evenly distributed shades
        const maxShades = Math.min(6, colorsToSample.length);
        const step = colorsToSample.length / maxShades;

        for (let i = 0; i < maxShades; i++) {
            const index = Math.floor(i * step);
            previewColors.push(colorsToSample[index].hex);
        }
    } else {
        // Multiple hues: pick one color from each hue
        let huesToDisplay;
        if (nonNeutralHues.length >= 6) {
            // Skip neutral if we have 6+ other hues
            huesToDisplay = nonNeutralHues.slice(0, 6);
        } else {
            // Use all hues up to 6
            huesToDisplay = hues.slice(0, 6);
        }

        huesToDisplay.forEach(hueName => {
            const hueColors = palette.colors[hueName];
            const midIndex = Math.floor(hueColors.length / 2);
            previewColors.push(hueColors[midIndex].hex);
        });
    }

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

    // Share button listener
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling if needed
            copyShareLink();
        });
    }

    // Tab switching
    document.querySelectorAll('.palette-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });

    // Copy CSS Code button
    const copyCssBtn = document.getElementById('copy-css-btn');
    if (copyCssBtn) {
        copyCssBtn.addEventListener('click', () => {
            const code = document.getElementById('css-code-content').textContent;
            copyToClipboard(code, 'copy-css-btn');
        });
    }
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

    // Update URL without reloading
    const newUrl = new URL(window.location);
    newUrl.searchParams.set('palette', paletteId);
    window.history.pushState({ paletteId: paletteId }, '', newUrl);

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

    // Reset to visual tab
    switchTab('visual');

    // Populate CSS code view (pre-load it)
    const cssContent = generateCSS(palette);
    const codeElement = document.getElementById('css-code-content');
    codeElement.textContent = cssContent;
    
    // Trigger syntax highlighting if Prism is available
    if (window.Prism) {
        Prism.highlightElement(codeElement);
    }

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

    // Calculate luminance to decide if we need a border
    const rgb = hexToRgb(color.hex);
    const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
    const isLight = luminance > 0.95;

    swatch.innerHTML = `
        <div class="swatch-color${isLight ? ' light-swatch' : ''}" style="background-color: ${color.hex};"></div>
        <div class="swatch-info">
            <div class="swatch-name">${color.name}</div>
            <div class="swatch-hex">${color.hex}</div>
        </div>
    `;

    return swatch;
}

// Calculate relative luminance
function getLuminance(r, g, b) {
    const a = [r, g, b].map(function (v) {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
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



// Switch between Visual and CSS tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.palette-tab').forEach(tab => {
        if (tab.dataset.tab === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });

    // Toggle views
    const swatches = document.getElementById('color-swatches');
    const codeView = document.getElementById('css-code-view');

    if (tabName === 'visual') {
        swatches.style.display = ''; // default flex
        codeView.style.display = 'none';
    } else {
        swatches.style.display = 'none';
        codeView.style.display = 'block';
    }
}

// Copy text to clipboard with feedback (generic)
function copyToClipboard(text, buttonId = null) {
    // Function to show feedback
    const showFeedback = () => {
        if (buttonId) {
            const btn = document.getElementById(buttonId);
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => {
                btn.textContent = originalText;
            }, 2000);
        } else {
            // Default tooltip behavior for share button
            const tooltip = document.getElementById('share-tooltip');
            if (tooltip) {
                const originalText = tooltip.textContent;
                tooltip.textContent = 'Copied!';
                tooltip.classList.add('visible');
                setTimeout(() => {
                    tooltip.textContent = originalText;
                    tooltip.classList.remove('visible');
                }, 2000);
            }
        }
    };

    // Try Navigator Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(showFeedback)
            .catch(err => {
                console.warn('Navigator clipboard failed, trying fallback:', err);
                fallbackCopy(text, showFeedback);
            });
    } else {
        fallbackCopy(text, showFeedback);
    }
}

// Fallback using temporary textarea
function fallbackCopy(text, callback) {
    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        
        // Ensure it's not visible but part of DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        
        textArea.focus();
        textArea.select();
        
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (successful) {
            if (callback) callback();
        } else {
            console.error('Fallback copy failed');
        }
    } catch (err) {
        console.error('Fallback copy error:', err);
    }
}

// Copy share link (specific wrapper)
function copyShareLink() {
    copyToClipboard(window.location.href);
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
