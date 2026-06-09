'use strict';

let uploadedImage = null;
let offscreenCanvas = null;
let offscreenCtx = null;
let previewDebounce = null;

const state = {
    dotsPerRow: 40,
    angle: 45,
    minRadius: 1,
    gridType: 'square'
};

function loadImage(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            uploadedImage = img;
            offscreenCanvas = document.createElement('canvas');
            offscreenCanvas.width = img.naturalWidth;
            offscreenCanvas.height = img.naturalHeight;
            offscreenCtx = offscreenCanvas.getContext('2d');
            offscreenCtx.drawImage(img, 0, 0);

            document.getElementById('uploadFileName').textContent = file.name;
            document.getElementById('uploadFileInfo').style.display = 'flex';
            document.getElementById('uploadPrompt').style.display = 'none';
            document.getElementById('halftoneCanvas').style.display = 'block';
            document.getElementById('previewPlaceholder').style.display = 'none';

            renderPreview();
            updateDownloadButton();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function rgbToLuminance(r, g, b) {
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function samplePixel(imageData, x, y) {
    const px = Math.min(imageData.width - 1, Math.max(0, Math.round(x)));
    const py = Math.min(imageData.height - 1, Math.max(0, Math.round(y)));
    const idx = (py * imageData.width + px) * 4;
    return { r: imageData.data[idx], g: imageData.data[idx + 1], b: imageData.data[idx + 2] };
}

// Core halftone generator with correct rotation coverage.
// The grid is defined in rotated space and covers the full image diagonal,
// then each cell is rotated back to image space. A clipPath in the SVG output
// trims dots to the image rectangle — this is the fix for the rotation-clipping
// bug present in other tools.
function getCircles(imageData, cellSize, angleDeg, minR, gridType) {
    const w = imageData.width;
    const h = imageData.height;
    const rad = angleDeg * Math.PI / 180;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);
    const diagonal = Math.sqrt(w * w + h * h);
    const halfDiag = diagonal / 2;
    const cx = w / 2;
    const cy = h / 2;
    const maxR = cellSize * 0.45;
    const cellSizeY = gridType === 'diamond' ? cellSize * 0.5 : cellSize;

    const circles = [];
    let rowIndex = 0;

    for (let gy = -halfDiag; gy <= halfDiag; gy += cellSizeY) {
        const xOffset = (gridType === 'diamond' && rowIndex % 2 === 1) ? cellSize / 2 : 0;
        for (let gx = -halfDiag; gx <= halfDiag; gx += cellSize) {
            const agx = gx + xOffset;
            const ix = agx * cosA - gy * sinA + cx;
            const iy = agx * sinA + gy * cosA + cy;

            if (ix < 0 || ix >= w || iy < 0 || iy >= h) continue;

            // 5-point multi-sample: center + 4 cardinal offsets at half cell size.
            // Averaging suppresses per-pixel noise without preprocessing the image.
            const hs = maxR;
            const center = samplePixel(imageData, ix, iy);
            const luma = ({ r, g, b }) => 1 - rgbToLuminance(r, g, b);
            const channelValue = (
                luma(center) +
                luma(samplePixel(imageData, ix + hs, iy)) +
                luma(samplePixel(imageData, ix - hs, iy)) +
                luma(samplePixel(imageData, ix, iy + hs)) +
                luma(samplePixel(imageData, ix, iy - hs))
            ) / 5;

            const radius = channelValue * (maxR - minR) + minR;
            if (radius <= 0) continue;

            circles.push({ x: ix, y: iy, r: radius });
        }
        rowIndex++;
    }

    return circles;
}

function buildSVG(circles, w, h) {
    const parts = [
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">`,
        `  <defs><clipPath id="imgClip"><rect width="${w}" height="${h}"/></clipPath></defs>`,
        `  <g clip-path="url(#imgClip)">`
    ];

    for (const c of circles) {
        parts.push(`    <circle cx="${c.x.toFixed(2)}" cy="${c.y.toFixed(2)}" r="${c.r.toFixed(2)}" fill="#000000"/>`);
    }

    parts.push('  </g>', '</svg>');
    return parts.join('\n');
}

function renderPreview() {
    if (!offscreenCanvas) return;

    const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    const w = imageData.width;
    const h = imageData.height;
    const cellSize = w / Math.max(1, state.dotsPerRow);
    const minR = Math.max(0, state.minRadius);

    const canvas = document.getElementById('halftoneCanvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = '#000000';
    const circles = getCircles(imageData, cellSize, state.angle, minR, state.gridType);
    for (const c of circles) {
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

function schedulePreview() {
    clearTimeout(previewDebounce);
    previewDebounce = setTimeout(renderPreview, 150);
}

function generateMonoSVG() {
    const imageData = offscreenCtx.getImageData(0, 0, offscreenCanvas.width, offscreenCanvas.height);
    const w = imageData.width, h = imageData.height;
    const cellSize = w / Math.max(1, state.dotsPerRow);
    const circles = getCircles(imageData, cellSize, state.angle, state.minRadius, state.gridType);
    return buildSVG(circles, w, h);
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function updateDownloadButton() {
    document.getElementById('downloadBtn').disabled = !uploadedImage;
}

document.addEventListener('DOMContentLoaded', () => {
    state.gridType   = document.querySelector('input[name="gridType"]:checked')?.value || 'square';
    state.dotsPerRow = Math.max(5, parseInt(document.getElementById('dotsPerRow').value) || 40);
    state.angle      = parseFloat(document.getElementById('angle').value) || 0;
    state.minRadius  = Math.max(0, parseFloat(document.getElementById('minRadius').value) || 0);

    const uploadZone = document.getElementById('uploadZone');
    const imageInput = document.getElementById('imageUpload');

    uploadZone.addEventListener('click', (e) => {
        if (e.target === document.getElementById('clearImageBtn')) return;
        imageInput.click();
    });

    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) loadImage(file);
    });

    imageInput.addEventListener('change', (e) => {
        if (e.target.files[0]) loadImage(e.target.files[0]);
    });

    document.getElementById('clearImageBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        uploadedImage = null;
        offscreenCanvas = null;
        offscreenCtx = null;
        imageInput.value = '';
        document.getElementById('uploadPrompt').style.display = '';
        document.getElementById('uploadFileInfo').style.display = 'none';
        const canvas = document.getElementById('halftoneCanvas');
        canvas.style.display = 'none';
        canvas.width = 0;
        canvas.height = 0;
        document.getElementById('previewPlaceholder').style.display = '';
        updateDownloadButton();
    });

    document.getElementById('dotsPerRow').addEventListener('input', (e) => {
        state.dotsPerRow = Math.max(5, parseInt(e.target.value) || 40);
        schedulePreview();
    });

    document.getElementById('angle').addEventListener('input', (e) => {
        state.angle = parseFloat(e.target.value) || 0;
        schedulePreview();
    });

    document.getElementById('minRadius').addEventListener('input', (e) => {
        state.minRadius = Math.max(0, parseFloat(e.target.value) || 0);
        schedulePreview();
    });

    document.querySelectorAll('input[name="gridType"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.gridType = e.target.value;
            schedulePreview();
        });
    });

    document.getElementById('downloadBtn').addEventListener('click', () => {
        if (!offscreenCanvas) return;
        downloadFile(generateMonoSVG(), 'halftone-mono.svg', 'image/svg+xml');
    });
});
