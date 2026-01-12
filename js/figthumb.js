const statusConfig = {
    'in-progress': { label: 'In Progress', cssClass: 'thumb-badge--in-progress' },
    'review': { label: 'Review', cssClass: 'thumb-badge--review' },
    'paused': { label: 'Paused', cssClass: 'thumb-badge--paused' },
    'dev': { label: 'Ready For Dev', cssClass: 'thumb-badge--dev' },
    'completed': { label: 'Completed', cssClass: 'thumb-badge--completed' },
    'archived': { label: 'Archived', cssClass: 'thumb-badge--archived' },
    'deprecated': { label: 'Deprecated', cssClass: 'thumb-badge--deprecated' }
};

// Custom logo state
let customLogoBase64 = null;
let customLogoDimensions = { width: 0, height: 0, ratio: 0 };

// Header Config State
let headerConfig = {
    type: 'gradient', // gradient, solid, none
    // Default gradient values
    value: { id: 'default', stops: [{ offset: '0.6%', color: '#5306BE' }, { offset: '99.06%', color: '#CC7956' }] }
};

const headerPresets = [
    {
        id: 'default',
        label: 'Purple/Orange',
        stops: [{ offset: '0%', color: '#5306BE' }, { offset: '100%', color: '#CC7956' }]
    },
    {
        id: 'blue',
        label: 'Blue/Cyan',
        stops: [{ offset: '0%', color: '#1E3A8A' }, { offset: '100%', color: '#06B6D4' }]
    },
    {
        id: 'green',
        label: 'Green/Emerald',
        stops: [{ offset: '0%', color: '#064E3B' }, { offset: '100%', color: '#10B981' }]
    },
    {
        id: 'dark',
        label: 'Neutral Dark',
        stops: [{ offset: '0%', color: '#1F2937' }, { offset: '100%', color: '#4B5563' }]
    },
    {
        id: 'sunset',
        label: 'Red/Yellow',
        stops: [{ offset: '0%', color: '#BE123C' }, { offset: '100%', color: '#F59E0B' }]
    }
];

// Icon paths for OS and Platform types (light theme)
const iconPaths = {
    os: {
        ios: 'assets/icons/icon-os-ios-on-light.svg',
        android: 'assets/icons/icon-os-android-on-light.svg'
    },
    platform: {
        watch: 'assets/icons/icon-platform-watch-on-light.svg',
        mobile: 'assets/icons/icon-platform-mobile-on-light.svg',
        laptop: 'assets/icons/icon-platform-laptopon-light.svg',
        desktop: 'assets/icons/icon-platform-desktop-on-light.svg'
    }
};

// Update download button state based on status and format selection
function updateDownloadButtonState() {
    const downloadBtn = document.getElementById('downloadBtn');
    const status = document.getElementById('status').value;
    const exportFormat = document.getElementById('exportFormat').value;

    // Enable only if status and format are selected
    downloadBtn.disabled = !(status && exportFormat);
}

function generateThumbnails() {
    const grid = document.getElementById('thumbnailGrid');

    // Text field values
    const designSystemName = document.getElementById('designSystemName').value || 'Design System Name';
    const fileName = document.getElementById('fileName').value || 'File Name';
    const projectType = document.getElementById('projectType').value || 'Project Type';
    const description = document.getElementById('description').value || 'Description';
    const status = document.getElementById('status').value;

    // Text field visibility toggles
    const showDesignSystemName = document.getElementById('showDesignSystemName').checked;
    const showProjectType = document.getElementById('showProjectType').checked;
    const showDescription = document.getElementById('showDescription').checked;

    // OS checkboxes
    const showIos = document.getElementById('osIos').checked;
    const showAndroid = document.getElementById('osAndroid').checked;

    // Platform checkboxes
    const showWatch = document.getElementById('platformWatch').checked;
    const showMobile = document.getElementById('platformMobile').checked;
    const showLaptop = document.getElementById('platformLaptop').checked;
    const showDesktop = document.getElementById('platformDesktop').checked;

    // Get status info, fallback to default placeholder if none selected
    const statusInfo = statusConfig[status] || { label: 'File Status', cssClass: 'thumb-badge--default' };

    // Build OS icons HTML
    let iconsHtml = '';
    if (showIos) {
        iconsHtml += `<div class="thumb-platform-icon"><img src="${iconPaths.os.ios}" alt="iOS"></div>`;
    }
    if (showAndroid) {
        iconsHtml += `<div class="thumb-platform-icon"><img src="${iconPaths.os.android}" alt="Android"></div>`;
    }

    // Build platform icons HTML (largest to smallest)
    if (showDesktop) {
        iconsHtml += `<div class="thumb-platform-icon"><img src="${iconPaths.platform.desktop}" alt="Desktop"></div>`;
    }
    if (showLaptop) {
        iconsHtml += `<div class="thumb-platform-icon"><img src="${iconPaths.platform.laptop}" alt="Laptop"></div>`;
    }
    if (showMobile) {
        iconsHtml += `<div class="thumb-platform-icon"><img src="${iconPaths.platform.mobile}" alt="Mobile"></div>`;
    }
    if (showWatch) {
        iconsHtml += `<div class="thumb-platform-icon"><img src="${iconPaths.platform.watch}" alt="Watch"></div>`;
    }

    grid.innerHTML = `
        <div class="thumbnail" id="generatedThumbnail">
            <div class="thumb-content">
                <div class="thumb-top-container">
                    <div class="thumb-header">
                        <div class="thumb-logo">
                            ${customLogoBase64 ? `<img src="${customLogoBase64}" alt="Logo">` : ''}
                        </div>
                    </div>
                    <div class="thumb-text-group">
                        ${showDesignSystemName ? `<div class="thumb-ds-name">${designSystemName}</div>` : ''}
                        <div class="thumb-file-name">${fileName}</div>
                        ${showProjectType ? `<div class="thumb-project-type">${projectType}</div>` : ''}
                        ${showDescription ? `<div class="thumb-description">${description}</div>` : ''}
                    </div>
                </div>
                <div class="thumb-footer-row">
                    <div class="thumb-divider"></div>
                    <div class="thumb-status-row">
                        <div class="thumb-badge ${statusInfo.cssClass}">${statusInfo.label}</div>
                        <div class="thumb-platforms">
                            ${iconsHtml}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Set up download button click handler and update state
    const downloadBtn = document.getElementById('downloadBtn');
    downloadBtn.onclick = downloadThumbnail;
    updateDownloadButtonState();



    // Calculate and apply scale based on actual container width
    updateThumbnailScale();
    
    // Apply header style to preview
    updatePreviewHeader();
}

function updatePreviewHeader() {
    const thumbHeader = document.querySelector('.thumb-header');
    if (!thumbHeader) return;

    if (headerConfig.type === 'none') {
        thumbHeader.style.background = 'transparent';
        thumbHeader.style.border = 'none'; 
    } else if (headerConfig.type === 'solid') {
        thumbHeader.style.background = headerConfig.value;
        thumbHeader.style.border = 'none';
    } else {
        // Gradient
        const stops = headerConfig.value.stops.map(s => `${s.color} ${s.offset}`).join(', ');
        thumbHeader.style.background = `linear-gradient(91deg, ${stops})`;
        thumbHeader.style.border = 'none';
    }
}

function updateThumbnailScale() {
    const thumbnail = document.querySelector('.thumbnail');
    if (thumbnail) {
        const containerWidth = thumbnail.offsetWidth;
        const scale = containerWidth / 1920;
        const thumbContent = thumbnail.querySelector('.thumb-content');
        if (thumbContent) {
            thumbContent.style.setProperty('--thumb-scale', scale);
            thumbContent.style.transform = `scale(${scale})`;
        }
    }
}



async function downloadThumbnail() {
    const thumbnail = document.getElementById('generatedThumbnail');
    const fileName = document.getElementById('fileName').value || 'File Name';
    const projectType = document.getElementById('projectType').value || 'Project Type';
    const exportFormat = document.getElementById('exportFormat').value;

    // Create filename from project details
    const timestamp = new Date().toISOString().split('T')[0];
    const safeFileName = fileName.replace(/\s+/g, '-');
    const safeProjectType = projectType.replace(/\s+/g, '-');
    const downloadFilename = `${safeFileName}_${safeProjectType}_${timestamp}.${exportFormat}`;

    try {
        const downloadBtn = document.getElementById('downloadBtn');
        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '⏳ Generating...';
        downloadBtn.disabled = true;

        if (exportFormat === 'svg') {
            downloadAsSVG(downloadFilename, downloadBtn, originalText);
        } else {
            downloadAsPNG(thumbnail, downloadFilename, downloadBtn, originalText);
        }
    } catch (error) {
        console.error('Export failed:', error);
        alert('Failed to export thumbnail. Please try again.');
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.innerHTML = '⬇️ Download Thumbnail';
        downloadBtn.disabled = false;
    }
}

function downloadAsSVG(filename, downloadBtn, originalText) {
    const computedStyles = getComputedStyle(document.documentElement);

    // Get CSS variable values
    const colorTextDefault = computedStyles.getPropertyValue('--color-text-default').trim() || '#222323';
    const colorTextWhite = computedStyles.getPropertyValue('--color-text-white').trim() || '#ffffff';
    const colorTextNeutralMedium = computedStyles.getPropertyValue('--color-text-neutral-medium').trim() || '#515151';
    const colorBgNeutralMedium = computedStyles.getPropertyValue('--color-background-neutral-medium').trim() || '#a5a5a5';
    const colorBgNeutralDark = computedStyles.getPropertyValue('--color-background-neutral-dark').trim() || '#515151';
    const colorBgSuccessDark = computedStyles.getPropertyValue('--color-background-success-dark').trim() || '#166534';
    const colorBgAlertMedium = computedStyles.getPropertyValue('--color-background-alert-medium').trim() || '#e0c872';
    const colorBgPurpleMedium = computedStyles.getPropertyValue('--color-background-purple-medium').trim() || '#8b23b3';
    const colorBgBlueDark = computedStyles.getPropertyValue('--color-background-blue-dark').trim() || '#1e3a8a';
    const colorBgTealMedium = computedStyles.getPropertyValue('--color-background-teal-medium').trim() || '#5eafa0';

    // Get current form values
    const designSystemName = document.getElementById('designSystemName').value || 'Design System Name';
    const fileName = document.getElementById('fileName').value || 'File Name';
    const projectType = document.getElementById('projectType').value || 'Project Type';
    const description = document.getElementById('description').value || 'Description';
    const status = document.getElementById('status').value;

    const showDesignSystemName = document.getElementById('showDesignSystemName').checked;
    const showProjectType = document.getElementById('showProjectType').checked;
    const showDescription = document.getElementById('showDescription').checked;

    const statusInfo = statusConfig[status] || { label: 'File Status', cssClass: 'thumb-badge--default' };

    // Status badge colors based on variant
    const badgeColors = {
        'thumb-badge--default': { bg: colorBgNeutralMedium, text: colorTextDefault },
        'thumb-badge--archived': { bg: colorBgNeutralMedium, text: colorTextDefault },
        'thumb-badge--deprecated': { bg: colorBgNeutralMedium, text: colorTextNeutralMedium },
        'thumb-badge--completed': { bg: colorBgSuccessDark, text: colorTextWhite },
        'thumb-badge--in-progress': { bg: colorBgAlertMedium, text: colorTextDefault },
        'thumb-badge--review': { bg: colorBgPurpleMedium, text: colorTextWhite },
        'thumb-badge--paused': { bg: colorBgBlueDark, text: colorTextWhite },
        'thumb-badge--dev': { bg: colorBgTealMedium, text: colorTextDefault }
    };
    const badgeColor = badgeColors[statusInfo.cssClass] || badgeColors['thumb-badge--default'];

    // Calculate text positions dynamically
    // SVG text y = baseline position. For proper layout, we position baselines.
    // Header ends at y=218 (64 top padding + 154 height), then 56px gap = 274 start
    // Each text element: add font size to get to baseline, then add 32px gap for next item
    let textY = 274; // Starting Y for text group (after header + gap)
    const textElements = [];

    if (showDesignSystemName) {
        textY += 40; // Baseline offset for 48px font (roughly 0.8 * font-size)
        textElements.push(`<text x="90" y="${textY}" font-family="Roboto, sans-serif" font-weight="500" font-size="48" fill="${colorTextNeutralMedium}">${escapeXml(designSystemName.toUpperCase())}</text>`);
        textY += 40; // Remaining height + 32px gap = ~72, but using smaller for tighter spacing like Figma
    }

    textY += 80; // Baseline offset for 96px font
    textElements.push(`<text x="90" y="${textY}" font-family="Roboto, sans-serif" font-weight="700" font-size="96" fill="${colorTextDefault}">${escapeXml(fileName)}</text>`);
    textY += 48; // Gap after file name

    if (showProjectType) {
        textY += 46; // Baseline offset for 56px font
        textElements.push(`<text x="90" y="${textY}" font-family="Roboto Mono, monospace" font-weight="500" font-size="56" fill="${colorTextDefault}" letter-spacing="2.8">${escapeXml(projectType.toUpperCase())}</text>`);
        textY += 42; // Gap after project type
    }

    if (showDescription) {
        textY += 46; // Baseline offset for 56px font
        textElements.push(`<text x="90" y="${textY}" font-family="Roboto, sans-serif" font-weight="400" font-size="56" fill="${colorTextDefault}">${escapeXml(description)}</text>`);
    }

    // Build platform/OS icons
    const showIos = document.getElementById('osIos').checked;
    const showAndroid = document.getElementById('osAndroid').checked;
    const showWatch = document.getElementById('platformWatch').checked;
    const showMobile = document.getElementById('platformMobile').checked;
    const showLaptop = document.getElementById('platformLaptop').checked;
    const showDesktop = document.getElementById('platformDesktop').checked;

    const iconSize = 72;
    const iconGap = 12;
    let iconX = 1830; // Start from right side
    const iconY = 968; // Footer row Y position
    const platformIcons = [];

    // Icon path data (extracted from SVG files - these are designed at 72x72)
    const iconPathData = {
        desktop: '<rect width="72" height="72" rx="8" fill="#A5A5A5"/><path d="M53.5 13.5H18.5C16.5109 13.5 14.6032 14.2902 13.1967 15.6967C11.7902 17.1032 11 19.0109 11 21V41C11 42.9891 11.7902 44.8968 13.1967 46.3033C14.6032 47.7098 16.5109 48.5 18.5 48.5H33.5V53.5H23.5C22.837 53.5 22.2011 53.7634 21.7322 54.2322C21.2634 54.7011 21 55.337 21 56C21 56.663 21.2634 57.2989 21.7322 57.7678C22.2011 58.2366 22.837 58.5 23.5 58.5H48.5C49.163 58.5 49.7989 58.2366 50.2678 57.7678C50.7366 57.2989 51 56.663 51 56C51 55.337 50.7366 54.7011 50.2678 54.2322C49.7989 53.7634 49.163 53.5 48.5 53.5H38.5V48.5H53.5C55.4891 48.5 57.3968 47.7098 58.8033 46.3033C60.2098 44.8968 61 42.9891 61 41V21C61 19.0109 60.2098 17.1032 58.8033 15.6967C57.3968 14.2902 55.4891 13.5 53.5 13.5ZM56 41C56 41.663 55.7366 42.2989 55.2678 42.7678C54.7989 43.2366 54.163 43.5 53.5 43.5H18.5C17.837 43.5 17.2011 43.2366 16.7322 42.7678C16.2634 42.2989 16 41.663 16 41V21C16 20.337 16.2634 19.7011 16.7322 19.2322C17.2011 18.7634 17.837 18.5 18.5 18.5H53.5C54.163 18.5 54.7989 18.7634 55.2678 19.2322C55.7366 19.7011 56 20.337 56 21V41Z" fill="white"/>',
        laptop: '<rect width="72" height="72" rx="8" fill="#A5A5A5"/><path d="M52.3282 20.6933C52.3282 20.4227 52.2206 20.1632 52.0292 19.9718C51.8379 19.7806 51.5783 19.6729 51.3077 19.6729H20.6943C20.4238 19.673 20.1641 19.7805 19.9728 19.9718C19.7815 20.1632 19.6738 20.4228 19.6738 20.6933V38.5512H52.3282V20.6933ZM15.1615 50.9121C15.0987 51.0619 15.0731 51.2244 15.0858 51.3865C15.0992 51.556 15.1546 51.7203 15.2472 51.8628C15.3399 52.0053 15.4666 52.1226 15.6159 52.2036C15.7653 52.2846 15.9324 52.3272 16.1022 52.3272H55.8997L56.0253 52.3192C56.1512 52.3035 56.2739 52.2646 56.386 52.2036C56.5353 52.1225 56.6622 52.0053 56.7548 51.8628C56.8473 51.7203 56.9028 51.5559 56.9162 51.3865C56.9294 51.2173 56.8994 51.0473 56.8305 50.8922V50.8902L53.0596 42.6329H18.9463L15.1615 50.9121ZM39.0623 46.2045C40.1895 46.2045 41.1032 47.1183 41.1032 48.2454C41.1032 49.3726 40.1895 50.2863 39.0623 50.2863H32.9396C31.8127 50.2861 30.8987 49.3724 30.8987 48.2454C30.8987 47.1184 31.8127 46.2047 32.9396 46.2045H39.0623ZM56.41 40.1456L60.5515 49.216L60.5615 49.236C60.9063 50.0124 61.0511 50.8625 60.984 51.7094C60.917 52.5565 60.6398 53.3744 60.1768 54.0871C59.714 54.7994 59.0797 55.3857 58.3333 55.7912C57.5869 56.1964 56.751 56.4085 55.9017 56.409H16.1022C15.2524 56.409 14.4157 56.1964 13.6687 55.7912C12.9217 55.3858 12.2884 54.7997 11.8251 54.0871C11.3618 53.3744 11.0832 52.5567 11.0159 51.7094C10.9489 50.8626 11.0938 50.0123 11.4385 49.236L11.4484 49.216L15.592 40.1476V20.6933C15.592 19.3402 16.1301 18.0427 17.0868 17.0859C18.0436 16.1291 19.3412 15.5912 20.6943 15.5911H51.3077C52.6608 15.5911 53.9583 16.1291 54.9152 17.0859C55.872 18.0427 56.41 19.3401 56.41 20.6933V40.1456Z" fill="white"/>',
        mobile: '<rect width="72" height="72" rx="8" fill="#A5A5A5"/><path d="M48.5 17.9995C48.4998 16.7784 47.5875 16.0002 46.7153 16H25.2847C24.414 16.0002 23.5002 16.7794 23.5 17.9995V54.0005C23.5002 55.2206 24.414 55.9998 25.2847 56H46.7153C47.5875 55.9998 48.4998 55.2216 48.5 54.0005V17.9995ZM39.75 18.5C41.1307 18.5 42.25 19.6193 42.25 21C42.25 22.3807 41.1307 23.5 39.75 23.5H32.25C30.8693 23.5 29.75 22.3807 29.75 21C29.75 19.6193 30.8693 18.5 32.25 18.5H39.75ZM53.5 54.0005C53.4997 57.7487 50.5776 60.9998 46.7153 61H25.2847C21.4258 60.9998 18.5003 57.7496 18.5 54.0005V17.9995C18.5003 14.2504 21.4258 11.0002 25.2847 11H46.7153C50.5776 11.0002 53.4997 14.2513 53.5 17.9995V54.0005Z" fill="white"/>',
        watch: '<rect width="72" height="72" rx="8" fill="#A5A5A5"/><path d="M18.5316 41.0334V30.9665C18.5316 27.4538 20.3663 24.0888 23.33 22.3316C23.4629 21.6604 23.5954 20.9079 23.776 19.9672C23.9942 18.8309 24.2781 17.5341 24.7298 16.3152C25.1753 15.1133 25.846 13.8043 26.9479 12.7756C28.1219 11.6794 29.6872 11.0002 31.6033 11H38.2649C40.1811 11.0002 41.7457 11.6797 42.9204 12.7756C44.0231 13.8043 44.6949 15.1129 45.1409 16.3152C45.593 17.5343 45.8789 18.8306 46.0971 19.9672C46.2777 20.9081 46.4057 21.6604 46.5383 22.3316C49.0178 23.801 50.7045 26.3948 51.1913 29.2597C52.4691 29.3748 53.468 30.3762 53.4685 31.5943V37.8878C53.4685 39.0586 52.5453 40.0256 51.3391 40.2018V41.0334C51.3391 44.5465 49.5023 47.909 46.5383 49.6661C46.4055 50.3379 46.2779 51.0909 46.0971 52.0328C45.8789 53.1694 45.593 54.4657 45.1409 55.6847C44.6949 56.8871 44.0231 58.1957 42.9204 59.2244C41.7457 60.3202 40.1811 60.9998 38.2649 61H31.6058C29.6896 60.9998 28.125 60.3202 26.9503 59.2244C25.8476 58.1957 25.1758 56.8871 24.7298 55.6847C24.2777 54.4657 23.9917 53.1694 23.7736 52.0328C23.5927 51.0907 23.4627 50.338 23.33 49.6661C20.3669 47.9087 18.5316 44.5458 18.5316 41.0334ZM28.742 51.208C28.9485 52.2839 29.1805 53.2897 29.5011 54.1543C29.828 55.0357 30.1861 55.5941 30.5263 55.9116C30.7944 56.1617 31.0876 56.3078 31.6058 56.3079H38.2649C38.7831 56.3078 39.0763 56.1617 39.3444 55.9116C39.6846 55.5941 40.0427 55.0357 40.3696 54.1543C40.6902 53.2897 40.9221 52.2839 41.1287 51.208C41.146 51.1176 41.1605 51.0247 41.1779 50.9308H28.6927C28.7102 51.0247 28.7247 51.1176 28.742 51.208ZM31.6033 15.6921C31.0868 15.6922 30.7937 15.8368 30.5263 16.0861C30.1864 16.4035 29.8303 16.964 29.5036 17.8457C29.1832 18.7105 28.9511 19.7158 28.7445 20.792C28.7271 20.8826 28.7102 20.9752 28.6927 21.0692H41.1779C41.1605 20.9753 41.146 20.8824 41.1287 20.792C40.9221 19.7161 40.6902 18.7103 40.3696 17.8457C40.0427 16.9643 39.6846 16.4059 39.3444 16.0884C39.0763 15.8383 38.7831 15.6922 38.2649 15.6921H31.6033ZM23.5789 41.0334C23.5789 44.2686 25.9136 46.2387 27.9953 46.2387H41.8754C43.9571 46.2387 46.2918 44.2686 46.2918 41.0334V30.9665C46.2918 27.7314 43.9571 25.7613 41.8754 25.7613H27.9953C25.9136 25.7613 23.5789 27.7314 23.5789 30.9665V41.0334Z" fill="white"/>',
        ios: '<rect width="72" height="72" rx="8" fill="#A5A5A5"/><path d="M36.0116 21.48C36.0811 19.3807 36.6564 16.2909 38.6676 14.2611C40.5349 12.3752 42.8082 11.4566 44.2232 11.0368C44.3479 10.9978 44.4801 10.9896 44.6086 11.0131C44.737 11.0366 44.8578 11.091 44.9606 11.1716C45.0633 11.2522 45.1449 11.3566 45.1983 11.4758C45.2517 11.5949 45.2753 11.7253 45.2671 11.8556C45.1743 13.8645 44.6454 16.8615 43.2815 18.4667C41.9963 19.9792 39.9318 21.9834 36.9046 22.3221C36.7886 22.3346 36.6713 22.3219 36.5607 22.2847C36.4502 22.2475 36.3489 22.1869 36.2641 22.1068C36.1792 22.0268 36.1126 21.9293 36.0691 21.8211C36.0255 21.7129 36.0058 21.5965 36.0116 21.48Z" fill="white"/><path d="M41.1937 59.8801C42.6482 60.4368 44.1165 60.9982 45.4457 60.9982C48.292 60.9982 56.5756 54.4335 56.8725 47.6182C56.8748 47.4465 56.8294 47.2776 56.7413 47.1301C56.6533 46.9827 56.526 46.8626 56.3738 46.7832C54.2675 45.6048 50.8251 42.668 50.7068 38.3975C50.5676 33.4194 53.0659 29.4667 54.9564 27.8313C55.3833 27.4625 55.5294 26.813 55.149 26.4001C53.4278 24.5211 49.9668 21.9347 46.8074 21.9973C44.5109 22.0437 42.4394 22.902 40.6602 23.635C39.2986 24.1987 38.1086 24.6905 37.1204 24.6905C36.1855 24.6905 35.0628 24.2033 33.7731 23.6396C32.0379 22.8834 30.0012 21.9973 27.7187 21.9973C23.4876 21.9973 15.1274 25.507 15.1274 39.0516C15.1274 46.2311 22.5388 61.1884 28.795 60.9982C30.1451 60.9982 31.5879 60.4415 33.0215 59.8848C34.4318 59.3373 35.8306 58.7945 37.1204 58.7945C38.366 58.7945 39.7718 59.335 41.1937 59.8801Z" fill="white"/>',
        android: '<rect width="72" height="72" rx="8" fill="#A5A5A5"/><path fill-rule="evenodd" clip-rule="evenodd" d="M24.3016 11.3377C24.4084 11.2306 24.5352 11.1457 24.6749 11.0878C24.8145 11.0298 24.9642 11 25.1154 11C25.2666 11 25.4163 11.0298 25.5559 11.0878C25.6955 11.1457 25.8224 11.2306 25.9291 11.3377L28.4693 13.8801C30.438 12.7418 32.6731 12.1454 34.9472 12.1514H36.5701C38.8459 12.1452 41.0828 12.7425 43.0526 13.8824L45.5973 11.3377C45.8131 11.1222 46.1057 11.0012 46.4107 11.0014C46.7157 11.0016 47.0082 11.123 47.2237 11.3388C47.4392 11.5546 47.5601 11.8472 47.5599 12.1522C47.5597 12.4572 47.4383 12.7497 47.2225 12.9652L44.9606 15.2272C46.4003 16.4453 47.5569 17.9629 48.3498 19.6741C49.1426 21.3853 49.5526 23.2489 49.5512 25.1348C49.5506 25.3496 49.4648 25.5554 49.3127 25.7071C49.1606 25.8588 48.9545 25.944 48.7397 25.944H22.7776C22.5623 25.944 22.3559 25.8585 22.2038 25.7063C22.0516 25.5541 21.9661 25.3477 21.9661 25.1325C21.9661 21.1603 23.7499 17.6041 26.5636 15.2249L24.3016 12.9652C24.1946 12.8584 24.1097 12.7316 24.0517 12.592C23.9938 12.4523 23.964 12.3026 23.964 12.1514C23.964 12.0002 23.9938 11.8506 24.0517 11.7109C24.1097 11.5713 24.1946 11.4444 24.3016 11.3377ZM32.3105 19.6224C32.3105 20.0796 32.1289 20.5182 31.8055 20.8415C31.4822 21.1648 31.0437 21.3465 30.5864 21.3465C30.1292 21.3465 29.6907 21.1648 29.3673 20.8415C29.044 20.5182 28.8624 20.0796 28.8624 19.6224C28.8624 19.1651 29.044 18.7266 29.3673 18.4033C29.6907 18.08 30.1292 17.8983 30.5864 17.8983C31.0437 17.8983 31.4822 18.08 31.8055 18.4033C32.1289 18.7266 32.3105 19.1651 32.3105 19.6224ZM40.8711 21.3465C41.3283 21.3465 41.7668 21.1648 42.0902 20.8415C42.4135 20.5182 42.5951 20.0796 42.5951 19.6224C42.5951 19.1651 42.4135 18.7266 42.0902 18.4033C41.7668 18.08 41.3283 17.8983 40.8711 17.8983C40.4138 17.8983 39.9753 18.08 39.652 18.4033C39.3286 18.7266 39.147 19.1651 39.147 19.6224C39.147 20.0796 39.3286 20.5182 39.652 20.8415C39.9753 21.1648 40.4138 21.3465 40.8711 21.3465Z" fill="white"/><path d="M17.3686 28.1209C16.7589 28.1209 16.1742 28.3631 15.7431 28.7942C15.312 29.2253 15.0698 29.81 15.0698 30.4196V44.2122C15.0698 44.8218 15.312 45.4065 15.7431 45.8377C16.1742 46.2687 16.7589 46.5109 17.3686 46.5109C17.9782 46.5109 18.5629 46.2687 18.994 45.8377C19.4251 45.4065 19.6673 44.8218 19.6673 44.2122V30.4196C19.6673 29.81 19.4251 29.2253 18.994 28.7942C18.5629 28.3631 17.9782 28.1209 17.3686 28.1209ZM24.2648 28.1209C23.6552 28.1209 23.0705 28.3631 22.6394 28.7942C22.2083 29.2253 21.9661 29.81 21.9661 30.4196V51.1085C21.9661 51.7181 22.2083 52.3028 22.6394 52.7339C23.0705 53.165 23.6552 53.4072 24.2648 53.4072H47.2524C47.8621 53.4072 48.4468 53.165 48.8779 52.7339C49.309 52.3028 49.5512 51.7181 49.5512 51.1085V30.4196C49.5512 29.81 49.309 29.2253 48.8779 28.7942C48.4468 28.3631 47.8621 28.1209 47.2524 28.1209H24.2648ZM52.3327 30.4196C52.3327 29.81 52.5749 29.2253 53.006 28.7942C53.4371 28.3631 54.0217 28.1209 54.6314 28.1209C55.2411 28.1209 55.8258 28.3631 56.2569 28.7942C56.688 29.2253 56.9302 29.81 56.9302 30.4196V44.2122C56.9302 44.8218 56.688 45.4065 56.2569 45.8377C55.8258 46.2687 55.2411 46.5109 54.6314 46.5109C54.0217 46.5109 53.4371 46.2687 53.006 45.8377C52.5749 45.4065 52.3327 44.8218 52.3327 44.2122V30.4196ZM26.0878 55.8278C25.9991 55.8278 25.9113 55.8453 25.8295 55.8793C25.7476 55.9133 25.6733 55.9631 25.6107 56.0259C25.5481 56.0887 25.4985 56.1632 25.4648 56.2452C25.4311 56.3272 25.4139 56.415 25.4142 56.5036V56.9772C25.4142 58.0441 25.8381 59.0673 26.5925 59.8217C27.3469 60.5762 28.3701 61 29.437 61C30.504 61 31.5272 60.5762 32.2816 59.8217C33.036 59.0673 33.4599 58.0441 33.4599 56.9772V56.5036C33.4602 56.415 33.443 56.3272 33.4093 56.2452C33.3756 56.1632 33.326 56.0887 33.2634 56.0259C33.2008 55.9631 33.1265 55.9133 33.0446 55.8793C32.9628 55.8453 32.875 55.8278 32.7863 55.8278H26.0878ZM38.0574 56.5036C38.0574 56.1289 38.3585 55.8278 38.7309 55.8278H45.4272C45.8019 55.8278 46.103 56.1289 46.103 56.5036V56.9772C46.103 58.0441 45.6792 59.0673 44.9248 59.8217C44.1703 60.5762 43.1471 61 42.0802 61C41.0133 61 39.9901 60.5762 39.2356 59.8217C38.4812 59.0673 38.0574 58.0441 38.0574 56.9772V56.5036Z" fill="white"/>'
    };

    // Build icons right-to-left
    const activeIcons = [];
    if (showDesktop) activeIcons.push('desktop');
    if (showLaptop) activeIcons.push('laptop');
    if (showMobile) activeIcons.push('mobile');
    if (showWatch) activeIcons.push('watch');
    if (showAndroid) activeIcons.push('android');
    if (showIos) activeIcons.push('ios');

    activeIcons.forEach((iconType) => {
        iconX -= iconSize;
        platformIcons.push(`<g transform="translate(${iconX}, ${iconY})">${iconPathData[iconType]}</g>`);
        iconX -= iconGap;
    });

    // Calculate badge width based on text length
    const badgeText = statusInfo.label.toUpperCase();
    const badgeCharWidth = 24; // Approximate width per character at 40px font
    const badgePadding = 84; // 42px padding on each side
    const badgeWidth = (badgeText.length * badgeCharWidth) + badgePadding;
    const badgeHeight = 80; // 20px padding top/bottom + ~40px text

    // SVG Header Definition
    let headerDefs = '';
    let headerFill = '';

    if (headerConfig.type === 'none') {
        headerFill = 'none'; 
        // Optional: add a stroke for "none" state? Currently sticking to transparent.
    } else if (headerConfig.type === 'solid') {
        headerFill = headerConfig.value;
    } else {
        // Gradient
        const stopsSvg = headerConfig.value.stops.map(s => 
            `<stop offset="${s.offset}" stop-color="${s.color}"/>`
        ).join('\n            ');
        
        headerDefs = `
    <defs>
        <linearGradient id="headerGradient" x1="0%" y1="50%" x2="100%" y2="50%">
            ${stopsSvg}
        </linearGradient>
    </defs>`;
        headerFill = 'url(#headerGradient)';
    }

    // Create SVG with native elements
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
    ${headerDefs}

    <!-- Background -->
    <rect width="1920" height="1080" fill="white"/>

    <!-- Header bar with gradient -->
    <rect x="90" y="64" width="1740" height="154" rx="20" fill="${headerFill}"/>

    <!-- Logo -->
    ${getSvgLogoMarkup()}

    <!-- Text group -->
    ${textElements.join('\n    ')}

    <!-- Divider line -->
    <rect x="90" y="928" width="1740" height="3" fill="${colorBgNeutralDark}"/>

    <!-- Status badge -->
    <rect x="90" y="${iconY}" width="${badgeWidth}" height="${badgeHeight}" rx="40" fill="${badgeColor.bg}"/>
    <text x="${90 + badgeWidth/2}" y="${iconY + 52}" font-family="Roboto Mono, monospace" font-weight="500" font-size="40" fill="${badgeColor.text}" text-anchor="middle">${escapeXml(badgeText)}</text>

    <!-- Platform icons -->
    ${platformIcons.join('\n    ')}
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

// Helper function to escape XML special characters
function escapeXml(str) {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
}

async function downloadAsPNG(thumbnail, filename, downloadBtn, originalText) {
    const thumbContent = thumbnail.querySelector('.thumb-content');

    // Temporarily remove scale transform for full-size capture
    const originalTransform = thumbContent.style.transform;
    thumbContent.style.transform = 'none';

    // Force layout recalculation
    thumbContent.offsetHeight;

    // Capture at 1:1 scale (content is already 1920x1080)
    const canvas = await html2canvas(thumbContent, {
        backgroundColor: '#ffffff',
        scale: 1,
        width: 1920,
        height: 1080,
        useCORS: true,
        allowTaint: true
    });

    // Restore the scale transform
    thumbContent.style.transform = originalTransform;

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

// Event listeners for text inputs
['designSystemName', 'fileName', 'projectType', 'description', 'status'].forEach(id => {
    document.getElementById(id).addEventListener('change', generateThumbnails);
    document.getElementById(id).addEventListener('input', generateThumbnails);
});

// Update input disabled state based on checkbox
function updateInputDisabledState(checkboxId, inputId) {
    const checkbox = document.getElementById(checkboxId);
    const input = document.getElementById(inputId);
    input.disabled = !checkbox.checked;
}

// Mapping of checkbox to input field
const toggleInputPairs = [
    ['showDesignSystemName', 'designSystemName'],
    ['showProjectType', 'projectType'],
    ['showDescription', 'description']
];

// Event listeners for text field visibility toggles
toggleInputPairs.forEach(([checkboxId, inputId]) => {
    document.getElementById(checkboxId).addEventListener('change', () => {
        updateInputDisabledState(checkboxId, inputId);
        generateThumbnails();
    });
    // Set initial state
    updateInputDisabledState(checkboxId, inputId);
});

// OS checkbox listeners
['osIos', 'osAndroid'].forEach(id => {
    document.getElementById(id).addEventListener('change', generateThumbnails);
});

// Platform checkbox listeners
['platformWatch', 'platformMobile', 'platformLaptop', 'platformDesktop'].forEach(id => {
    document.getElementById(id).addEventListener('change', generateThumbnails);
});

// Window resize listener to update scale
window.addEventListener('resize', updateThumbnailScale);

// Export format listener to update download button state
document.getElementById('exportFormat').addEventListener('change', updateDownloadButtonState);

// Initial generation
generateThumbnails();

// Header Color Logic
function initHeaderControls() {
    const container = document.getElementById('colorPresets');
    
    // Create Preset Buttons
    headerPresets.forEach(preset => {
        const btn = document.createElement('div');
        btn.className = 'color-swatch';
        btn.title = preset.label;
        if (preset.id === 'default') btn.classList.add('active');
        
        const stops = preset.stops.map(s => `${s.color} ${s.offset}`).join(', ');
        btn.style.background = `linear-gradient(135deg, ${stops})`;
        
        btn.onclick = () => {
            setHeaderState('gradient', preset);
            updateSwatchUI(btn);
        };
        container.appendChild(btn);
    });

    const customInput = document.getElementById('customColorInput');
    customInput.addEventListener('input', (e) => {
        setHeaderState('solid', e.target.value);
        updateSwatchUI(null); // Clear presets
    });

    const clearBtn = document.getElementById('clearHeaderColorBtn');
    clearBtn.addEventListener('click', () => {
        setHeaderState('none', null);
        updateSwatchUI(null);
    });
}

function setHeaderState(type, value) {
    headerConfig.type = type;
    headerConfig.value = value;
    generateThumbnails();
}

function updateSwatchUI(activeBtn) {
    document.querySelectorAll('.color-swatch').forEach(btn => btn.classList.remove('active'));
    if (activeBtn) activeBtn.classList.add('active');
}

// Initialize
initHeaderControls();
const logoInput = document.getElementById('logoUpload');
const clearLogoBtn = document.getElementById('clearLogoBtn');

logoInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('logoFileName').textContent = file.name;
        const reader = new FileReader();
        reader.onload = function(event) {
            customLogoBase64 = event.target.result;
            
            // Get dimensions for SVG export
            const img = new Image();
            img.onload = function() {
                customLogoDimensions.width = img.naturalWidth;
                customLogoDimensions.height = img.naturalHeight;
                customLogoDimensions.ratio = img.naturalWidth / img.naturalHeight;
                generateThumbnails();
            };
            img.src = customLogoBase64;
        };
        reader.readAsDataURL(file);
    }
});

clearLogoBtn.addEventListener('click', function() {
    logoInput.value = ''; // Clear input
    document.getElementById('logoFileName').textContent = 'No file chosen';
    customLogoBase64 = null;
    customLogoDimensions = { width: 0, height: 0, ratio: 0 };
    generateThumbnails();
});

function getSvgLogoMarkup() {
    if (!customLogoBase64) return '';

    // Calculate dimensions to fit within 94px height (154px header - 30px padding * 2)
    // while maintaining aspect ratio
    const maxHeight = 94;
    
    // Use the stored ratio
    let width = maxHeight * customLogoDimensions.ratio;
    let height = maxHeight;

    // Center vertically in the header (y=64, height=154). 
    // Logo padding is 30px, so it starts at y=94.
    const x = 120; // 30px padding left of header (x=90) -> 90+30=120
    const y = 94;  // 30px padding top of header (y=64) -> 64+30=94

    return `<image x="${x}" y="${y}" width="${width}" height="${height}" href="${customLogoBase64}" />`;
}
