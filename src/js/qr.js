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

    function currentLogoImage() {
        if (logoSvgText) {
            return logoRecolorCheckbox.checked
                ? svgToDataUrl(recolorSvg(logoSvgText, dotColorInput.value))
                : svgToDataUrl(logoSvgText);
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
            backgroundOptions: { color: mode === 'transparent' ? 'rgba(0,0,0,0)' : bgColorInput.value },
        });
    }

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
        qrCode.download({ name: 'qr-code', extension: exportFormat.value });
    });

    function updateDownloadState() {
        downloadBtn.disabled = !(textInput.value.trim() && exportFormat.value);
    }

    updateDownloadState();
}

document.addEventListener('DOMContentLoaded', initQrGenerator);
