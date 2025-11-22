const fs = require('fs');
const path = require('path');

const slidesDir = path.join(__dirname, 'slides');
const totalSlides = 26;

for (let i = 0; i < totalSlides; i++) {
    const filename = `slide-${i}.html`;
    const filePath = path.join(slidesDir, filename);

    try {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            const idAttr = `id="slide-${i}"`;

            // Check if ID already exists
            if (!content.includes(idAttr)) {
                // Replace <div class="slide"> with <div class="slide" id="slide-X">
                // Regex handles potential extra spaces or attributes, though we expect standard format
                const regex = /<div\s+class=["']slide["']([^>]*)>/i;

                if (regex.test(content)) {
                    content = content.replace(regex, `<div class="slide" id="slide-${i}"$1>`);
                    fs.writeFileSync(filePath, content, 'utf8');
                    console.log(`Updated ${filename}`);
                } else {
                    console.warn(`Skipped ${filename}: Could not find <div class="slide"> tag`);
                }
            } else {
                console.log(`Skipped ${filename}: ID already present`);
            }
        } else {
            console.warn(`File not found: ${filename}`);
        }
    } catch (err) {
        console.error(`Error processing ${filename}:`, err);
    }
}
