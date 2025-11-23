const fs = require('fs');
const path = require('path');

function getDimensions(filePath) {
    const buffer = fs.readFileSync(filePath);
    let offset = 0;
    if (buffer[0] !== 0xFF || buffer[1] !== 0xD8) return null; // Not JPEG

    offset += 2;
    while (offset < buffer.length) {
        while (buffer[offset] === 0xFF) offset++;
        const marker = buffer[offset];
        offset++;
        const len = (buffer[offset] << 8) + buffer[offset + 1];
        if (marker === 0xC0 || marker === 0xC2) {
            const height = (buffer[offset + 5] << 8) + buffer[offset + 6];
            const width = (buffer[offset + 7] << 8) + buffer[offset + 8];
            return { width, height };
        }
        offset += len;
    }
    return null;
}

const dirs = ['slide16'];
const baseDir = 'c:\\Users\\orkha\\Desktop\\test\\images';

dirs.forEach(dir => {
    const fullPath = path.join(baseDir, dir);
    if (fs.existsSync(fullPath)) {
        console.log(`\n--- Analyzing ${dir} ---`);
        const files = fs.readdirSync(fullPath);
        files.forEach(file => {
            if (file.endsWith('.jpg')) {
                const dims = getDimensions(path.join(fullPath, file));
                if (dims) {
                    const ratio = dims.width / dims.height;
                    const type = ratio > 1.2 ? 'Landscape' : (ratio < 0.8 ? 'Portrait' : 'Square-ish');
                    console.log(`${file}: ${dims.width}x${dims.height} (${type})`);
                } else {
                    console.log(`${file}: Could not read dimensions`);
                }
            }
        });
    } else {
        console.log(`Directory not found: ${fullPath}`);
    }
});
