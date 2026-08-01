// QR Code Generator Logic

let qrCode;
let logoSvgText = null; // raw SVG markup, when an SVG logo is uploaded
let logoRasterDataUrl = null; // data URL, when a PNG/JPEG logo is uploaded

const DEFAULT_ERROR_CORRECTION = 'Q';
const LOGO_ERROR_CORRECTION = 'H';

/**
 * Force every fill (attributes, inline styles, and <style> block rules) in an
 * SVG string to the given color, so the logo can match the QR foreground.
 */
function recolorSvg(svgText, color) {
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
    const svgEl = doc.documentElement;

    doc.querySelectorAll('style').forEach(styleEl => {
        styleEl.textContent = styleEl.textContent.replace(/fill\s*:\s*[^;}"']+/gi, `fill: ${color}`);
    });

    doc.querySelectorAll('*').forEach(el => {
        if (el.hasAttribute('fill') && el.getAttribute('fill').toLowerCase() !== 'none') {
            el.setAttribute('fill', color);
        }
        if (el.hasAttribute('style') && /fill\s*:/i.test(el.getAttribute('style'))) {
            el.setAttribute('style', el.getAttribute('style').replace(/fill\s*:\s*[^;]+/gi, `fill: ${color}`));
        }
    });

    // Fallback so elements with no fill anywhere (inherited default black) pick up the color too.
    svgEl.setAttribute('fill', color);

    return new XMLSerializer().serializeToString(svgEl);
}

function svgToDataUrl(svgText) {
    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgText)));
}

function getSvgDimensions(svgText) {
    const svgEl = new DOMParser().parseFromString(svgText, 'image/svg+xml').documentElement;
    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
        const parts = viewBox.trim().split(/[\s,]+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            return { width: parts[2], height: parts[3] };
        }
    }
    return {
        width: parseFloat(svgEl.getAttribute('width')) || 512,
        height: parseFloat(svgEl.getAttribute('height')) || 512,
    };
}

/**
 * Rewrite every id in an SVG document and all url(#id) / href="#id" references
 * to it, prefixed to avoid collisions when the markup gets inlined into
 * another SVG document (the QR code's own generated ids).
 */
function namespaceSvgIds(doc, prefix) {
    const idMap = new Map();
    doc.querySelectorAll('[id]').forEach(el => {
        const oldId = el.getAttribute('id');
        const newId = prefix + oldId;
        idMap.set(oldId, newId);
        el.setAttribute('id', newId);
    });
    if (idMap.size === 0) return;

    const rewriteUrlRefs = (value) =>
        value.replace(/url\(#([^)]+)\)/g, (m, id) => idMap.has(id) ? `url(#${idMap.get(id)})` : m);

    doc.querySelectorAll('*').forEach(el => {
        ['fill', 'stroke', 'clip-path', 'mask', 'filter'].forEach(attr => {
            if (el.hasAttribute(attr)) el.setAttribute(attr, rewriteUrlRefs(el.getAttribute(attr)));
        });
        if (el.hasAttribute('style')) el.setAttribute('style', rewriteUrlRefs(el.getAttribute('style')));
        const href = el.getAttribute('href');
        if (href && href.startsWith('#') && idMap.has(href.slice(1))) {
            el.setAttribute('href', '#' + idMap.get(href.slice(1)));
        }
    });
}

/**
 * Replace the QR library's <image> placeholder for the logo with the logo's
 * actual vector markup, positioned/scaled to fill the same box the library
 * reserved. Keeps SVG exports true vector instead of baking the logo to a
 * raster inside them.
 */
function inlineVectorLogo(qrSvgDoc, rawLogoSvgText) {
    const imageEl = qrSvgDoc.querySelector('image');
    if (!imageEl) return;

    const x = parseFloat(imageEl.getAttribute('x'));
    const y = parseFloat(imageEl.getAttribute('y'));
    const boxWidth = parseFloat(imageEl.getAttribute('width'));
    const boxHeight = parseFloat(imageEl.getAttribute('height'));
    const { width: logoWidth, height: logoHeight } = getSvgDimensions(rawLogoSvgText);

    const logoDoc = new DOMParser().parseFromString(rawLogoSvgText, 'image/svg+xml');
    namespaceSvgIds(logoDoc, 'logo-' + Math.random().toString(36).slice(2, 8) + '-');
    const logoRoot = logoDoc.documentElement;

    const group = qrSvgDoc.createElementNS('http://www.w3.org/2000/svg', 'g');
    const scaleX = boxWidth / logoWidth;
    const scaleY = boxHeight / logoHeight;
    group.setAttribute('transform', `translate(${x}, ${y}) scale(${scaleX}, ${scaleY})`);
    while (logoRoot.firstChild) group.appendChild(logoRoot.firstChild);

    imageEl.replaceWith(group);
}

/**
 * Build the SVG export, keeping an SVG logo as true vector markup rather than
 * embedding it as a nested-SVG <image> (renders fine in browsers, but isn't
 * supported by other SVG consumers — Illustrator silently drops it).
 */
async function downloadQrSvg(fileName, rawLogoSvgText) {
    const blob = await qrCode.getRawData('svg');
    const svgText = await blob.text();
    const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');

    if (rawLogoSvgText) inlineVectorLogo(doc, rawLogoSvgText);

    const finalSvg = '<?xml version="1.0" standalone="no"?>\r\n' +
        new XMLSerializer().serializeToString(doc.documentElement);
    const url = URL.createObjectURL(new Blob([finalSvg], { type: 'image/svg+xml' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

function initQrGenerator() {
    qrCode = new QRCodeStyling({
        width: 320,
        height: 320,
        type: 'canvas',
        data: 'https://example.com',
        margin: 12,
        qrOptions: { errorCorrectionLevel: DEFAULT_ERROR_CORRECTION },
        imageOptions: { hideBackgroundDots: true, imageSize: 0.35, margin: 6 },
        dotsOptions: { color: '#000000', type: 'square' },
        backgroundOptions: { color: '#ffffff' },
        cornersSquareOptions: { color: '#000000', type: 'square' },
        cornersDotOptions: { color: '#000000', type: 'square' },
    });
    qrCode.append(document.getElementById('qrPreview'));

    const textInput = document.getElementById('qrText');
    const dotColorInput = document.getElementById('dotColor');
    const bgColorInput = document.getElementById('bgColor');
    const bgTransparentBtn = document.getElementById('bgTransparentBtn');
    const logoInput = document.getElementById('logoUpload');
    const clearLogoBtn = document.getElementById('clearLogoBtn');
    const logoFileName = document.getElementById('logoFileName');
    const logoRecolorWrapper = document.getElementById('logoRecolorWrapper');
    const logoRecolorCheckbox = document.getElementById('logoRecolor');
    const downloadBtn = document.getElementById('downloadBtn');
    const exportFormat = document.getElementById('exportFormat');

    // The <image> the QR library draws with (preview + PNG canvas rendering
    // handle a nested SVG data URL fine). SVG *exports* replace this with true
    // vector markup separately — see downloadQrSvg()/inlineVectorLogo().
    function currentLogoImage() {
        if (logoSvgText) {
            const svgText = logoRecolorCheckbox.checked
                ? recolorSvg(logoSvgText, dotColorInput.value)
                : logoSvgText;
            return svgToDataUrl(svgText);
        }
        return logoRasterDataUrl || undefined;
    }

    function refreshLogoImage() {
        if (!logoSvgText && !logoRasterDataUrl) return;
        qrCode.update({ image: currentLogoImage() });
    }

    textInput.addEventListener('input', () => {
        qrCode.update({ data: textInput.value.trim() || ' ' });
        updateDownloadState();
    });

    dotColorInput.addEventListener('input', () => {
        const color = dotColorInput.value;
        qrCode.update({
            dotsOptions: { color },
            cornersSquareOptions: { color },
            cornersDotOptions: { color },
        });
        refreshLogoImage();
    });

    function setBgMode(mode) { // 'color' | 'transparent'
        bgColorInput.classList.toggle('active', mode === 'color');
        bgTransparentBtn.classList.toggle('active', mode === 'transparent');
        bgTransparentBtn.setAttribute('aria-pressed', mode === 'transparent' ? 'true' : 'false');
        document.getElementById('qrPreview').classList.toggle('checkerboard-bg', mode === 'transparent');
        qrCode.update({
            backgroundOptions: { color: mode === 'transparent' ? 'transparent' : bgColorInput.value },
        });
    }

    // 'click' (not just 'input') so choosing the same color again in the native
    // picker still switches back out of transparent mode — <input type="color">
    // doesn't fire 'input' when the confirmed value is unchanged.
    bgColorInput.addEventListener('click', () => setBgMode('color'));
    bgColorInput.addEventListener('input', () => setBgMode('color'));
    bgTransparentBtn.addEventListener('click', () => setBgMode('transparent'));

    document.querySelectorAll('input[name="dotShape"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.checked) qrCode.update({ dotsOptions: { type: radio.value } });
        });
    });

    document.querySelectorAll('input[name="cornerShape"]').forEach(radio => {
        radio.addEventListener('change', () => {
            if (!radio.checked) return;
            const squircle = radio.value === 'squircle';
            qrCode.update({
                cornersSquareOptions: { type: squircle ? 'extra-rounded' : 'square' },
                cornersDotOptions: { type: squircle ? 'dot' : 'square' },
            });
        });
    });

    logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        logoFileName.textContent = file.name;

        const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
        const reader = new FileReader();

        if (isSvg) {
            reader.onload = (ev) => {
                logoSvgText = ev.target.result;
                logoRasterDataUrl = null;
                logoRecolorWrapper.classList.add('visible');
                qrCode.update({
                    image: currentLogoImage(),
                    qrOptions: { errorCorrectionLevel: LOGO_ERROR_CORRECTION },
                });
            };
            reader.readAsText(file);
        } else {
            logoRecolorWrapper.classList.remove('visible');
            logoRecolorCheckbox.checked = false;
            reader.onload = (ev) => {
                logoRasterDataUrl = ev.target.result;
                logoSvgText = null;
                qrCode.update({
                    image: logoRasterDataUrl,
                    qrOptions: { errorCorrectionLevel: LOGO_ERROR_CORRECTION },
                });
            };
            reader.readAsDataURL(file);
        }
    });

    logoRecolorCheckbox.addEventListener('change', refreshLogoImage);

    clearLogoBtn.addEventListener('click', () => {
        logoSvgText = null;
        logoRasterDataUrl = null;
        logoInput.value = '';
        logoFileName.textContent = 'No file chosen';
        logoRecolorWrapper.classList.remove('visible');
        logoRecolorCheckbox.checked = false;
        qrCode.update({
            image: undefined,
            qrOptions: { errorCorrectionLevel: DEFAULT_ERROR_CORRECTION },
        });
    });

    exportFormat.addEventListener('change', updateDownloadState);

    downloadBtn.addEventListener('click', () => {
        if (exportFormat.value === 'svg' && logoSvgText) {
            const activeLogoSvg = logoRecolorCheckbox.checked
                ? recolorSvg(logoSvgText, dotColorInput.value)
                : logoSvgText;
            downloadQrSvg('qr-code.svg', activeLogoSvg);
        } else {
            qrCode.download({ name: 'qr-code', extension: exportFormat.value });
        }
    });

    function updateDownloadState() {
        downloadBtn.disabled = !(textInput.value.trim() && exportFormat.value);
    }

    // Browsers restore text input and radio button state across a page refresh
    // (native behavior, not something this script does) — but the qrCode
    // instance above was just built from hardcoded defaults, so it'd show a
    // plain example.com square code while the controls show the user's last
    // selections. Sync the QR preview to whatever the controls actually show
    // right now, whether that's a browser-restored value or the HTML default.
    function syncQrFromControls() {
        qrCode.update({ data: textInput.value.trim() || ' ' });

        const dotColor = dotColorInput.value;
        qrCode.update({
            dotsOptions: { color: dotColor },
            cornersSquareOptions: { color: dotColor },
            cornersDotOptions: { color: dotColor },
        });

        const checkedDotShape = document.querySelector('input[name="dotShape"]:checked');
        if (checkedDotShape) qrCode.update({ dotsOptions: { type: checkedDotShape.value } });

        const checkedCornerShape = document.querySelector('input[name="cornerShape"]:checked');
        if (checkedCornerShape) {
            const squircle = checkedCornerShape.value === 'squircle';
            qrCode.update({
                cornersSquareOptions: { type: squircle ? 'extra-rounded' : 'square' },
                cornersDotOptions: { type: squircle ? 'dot' : 'square' },
            });
        }

        // Background transparency is custom JS state, not a native form
        // control value, so it can't be browser-restored either way — always
        // resolve to the (also just-synced) solid color, matching the HTML's
        // own default active state.
        setBgMode('color');
    }

    syncQrFromControls();
    updateDownloadState();
}

document.addEventListener('DOMContentLoaded', initQrGenerator);
