const typeConfig = {
    components: { icon: '🧩', subtitle: 'Component Library', desc: 'Reusable UI components' },
    design: { icon: '✨', subtitle: 'Design Files', desc: 'Visual designs & mockups' },
    prototype: { icon: '🔗', subtitle: 'Interactive Prototype', desc: 'User flows & interactions' },
    tokens: { icon: '🎨', subtitle: 'Design Tokens', desc: 'Colors, typography, spacing' },
    specs: { icon: '📐', subtitle: 'Developer Specs', desc: 'Implementation details' },
    archive: { icon: '📦', subtitle: 'Archive', desc: 'Previous versions' }
};

const colorSchemes = {
    purple: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', text: '#ffffff', accent: '#fff', badge: 'rgba(255,255,255,0.2)' },
    blue: { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', text: '#ffffff', accent: '#fff', badge: 'rgba(255,255,255,0.2)' },
    green: { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', text: '#1a1a1a', accent: '#1a1a1a', badge: 'rgba(0,0,0,0.1)' },
    orange: { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', text: '#1a1a1a', accent: '#1a1a1a', badge: 'rgba(0,0,0,0.1)' },
    red: { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', text: '#ffffff', accent: '#fff', badge: 'rgba(255,255,255,0.2)' },
    gray: { bg: 'linear-gradient(135deg, #3a3a52 0%, #1a1a2e 100%)', text: '#ffffff', accent: '#fff', badge: 'rgba(255,255,255,0.2)' }
};

const statusConfig = {
    dev: { label: 'Dev Ready', color: '#10b981' },
    review: { label: 'In Review', color: '#f59e0b' },
    wip: { label: 'WIP', color: '#6366f1' },
    approved: { label: 'Approved', color: '#8b5cf6' }
};

function generateThumbnails() {
    const grid = document.getElementById('thumbnailGrid');
    const projectName = document.getElementById('projectName').value || 'Design System';
    const fileType = document.getElementById('fileType').value;
    const colorScheme = document.getElementById('colorScheme').value;
    const status = document.getElementById('status').value;

    const config = typeConfig[fileType];
    const colors = colorSchemes[colorScheme];
    const statusInfo = statusConfig[status];

    grid.innerHTML = `
        <div class="thumbnail" id="generatedThumbnail">
            <div class="thumb-content" style="background: ${colors.bg}; color: ${colors.text};">
                <div class="thumb-header">
                    <div class="thumb-icon" style="background: ${colors.badge}; color: ${colors.accent};">
                        ${config.icon}
                    </div>
                    <div class="thumb-title" style="color: ${colors.text};">${projectName}</div>
                </div>
                <div class="thumb-body">
                    <div class="thumb-subtitle" style="color: ${colors.text};">${config.subtitle}</div>
                    <div class="thumb-description" style="color: ${colors.text};">${config.desc}</div>
                </div>
                <div class="thumb-footer">
                    <div class="thumb-badge" style="background: ${colors.badge}; color: ${colors.accent};">
                        ${statusInfo.label}
                    </div>
                </div>
            </div>
        </div>
    `;

    // Enable download button and add click handler
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.disabled = false;
    downloadBtn.addEventListener('click', downloadThumbnail);

    // Add click handler for thumbnail selection
    const thumbnail = grid.querySelector('.thumbnail');
    thumbnail.addEventListener('click', selectThumbnail);
}

function selectThumbnail(e) {
    const thumbnail = e.currentTarget;
    document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('selected'));
    thumbnail.classList.add('selected');
}

async function downloadThumbnail() {
    const thumbnail = document.getElementById('generatedThumbnail');
    const projectName = document.getElementById('projectName').value || 'Design System';
    const fileType = document.getElementById('fileType').value;
    const status = document.getElementById('status').value;
    const exportFormat = document.getElementById('exportFormat').value;

    // Create filename from project details
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${projectName.replace(/\s+/g, '-')}_${fileType}_${timestamp}.${exportFormat}`;

    try {
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '⏳ Generating...';
        downloadBtn.disabled = true;

        if (exportFormat === 'svg') {
            downloadAsSVG(thumbnail, filename, downloadBtn, originalText);
        } else {
            downloadAsPNG(thumbnail, filename, downloadBtn, originalText);
        }
    } catch (error) {
        console.error('Export failed:', error);
        alert('❌ Failed to export thumbnail. Please try again.');
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.innerHTML = '⬇️ Download Thumbnail';
        downloadBtn.disabled = false;
    }
}

function downloadAsSVG(thumbnail, filename, downloadBtn, originalText) {
    const thumbContent = thumbnail.querySelector('.thumb-content');

    // Create SVG with foreignObject
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="960" xmlns="http://www.w3.org/2000/svg">
    <foreignObject width="1600" height="960">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 1600px; height: 960px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;">
            ${thumbContent.outerHTML}
            <style>
                .thumb-content {
                    width: 100%;
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    padding: 24px;
                    box-sizing: border-box;
                }
                .thumb-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 16px;
                }
                .thumb-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }
                .thumb-title {
                    font-size: 18px;
                    font-weight: 700;
                    flex: 1;
                }
                .thumb-body {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                .thumb-subtitle {
                    font-size: 12px;
                    font-weight: 600;
                    opacity: 0.7;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 4px;
                }
                .thumb-description {
                    font-size: 14px;
                    opacity: 0.85;
                }
                .thumb-footer {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: auto;
                }
                .thumb-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 600;
                }
            </style>
        </div>
    </foreignObject>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Reset button
    downloadBtn.innerHTML = originalText;
    downloadBtn.disabled = false;
}

async function downloadAsPNG(thumbnail, filename, downloadBtn, originalText) {
    // Use html2canvas to convert the thumbnail to an image at 1600x960 (Figma recommended size)
    const rect = thumbnail.getBoundingClientRect();
    const scale = 1600 / rect.width;

    const canvas = await html2canvas(thumbnail, {
        backgroundColor: null,
        scale: scale,
        useCORS: true,
        allowTaint: true
    });

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Reset button
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
    });
}

// Event listeners
['projectName', 'fileType', 'colorScheme', 'status'].forEach(id => {
    document.getElementById(id).addEventListener('change', generateThumbnails);
    document.getElementById(id).addEventListener('input', generateThumbnails);
});

// Initial generation
generateThumbnails();
