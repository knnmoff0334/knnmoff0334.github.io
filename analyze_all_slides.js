const fs = require('fs');
const path = require('path');

const slidesDir = './slides';
const issues = [];

// Check for expected slides (0-29)
console.log('=== SLIDE ANALYSIS REPORT ===\n');

// 1. Check JavaScript configuration
console.log('1. JavaScript Configuration:');
const scriptJs = fs.readFileSync('./js/script.js', 'utf8');
const loaderJs = fs.readFileSync('./js/loader.js', 'utf8');

const scriptTotalMatch = scriptJs.match(/totalSlides\s*=\s*(\d+)/);
const loaderTotalMatch = loaderJs.match(/totalSlides\s*=\s*(\d+)/);

if (scriptTotalMatch) {
    console.log(`   - script.js expects: ${scriptTotalMatch[1]} slides`);
    if (scriptTotalMatch[1] !== '30') {
        issues.push(`script.js has totalSlides = ${scriptTotalMatch[1]}, should be 30`);
    }
}

if (loaderTotalMatch) {
    console.log(`   - loader.js expects: ${loaderTotalMatch[1]} slides`);
    if (loaderTotalMatch[1] !== '30') {
        issues.push(`loader.js has totalSlides = ${loaderTotalMatch[1]}, should be 30`);
    }
}

// 2. Check for all expected slides
console.log('\n2. Slide Files Check:');
for (let i = 0; i < 30; i++) {
    const filename = `slide-${i}.html`;
    const filepath = path.join(slidesDir, filename);

    if (!fs.existsSync(filepath)) {
        issues.push(`Missing slide: ${filename}`);
        console.log(`   ✗ ${filename} - MISSING`);
    } else {
        console.log(`   ✓ ${filename} - EXISTS`);
    }
}

// 3. Check for unexpected files
console.log('\n3. Unexpected Files:');
const files = fs.readdirSync(slidesDir);
files.forEach(file => {
    if (file.endsWith('.backup') || file.startsWith('.')) {
        issues.push(`Unexpected file in slides folder: ${file}`);
        console.log(`   ✗ ${file} - SHOULD BE REMOVED`);
    }
});

// 4. Validate each slide structure
console.log('\n4. Slide Structure Validation:');
for (let i = 0; i < 30; i++) {
    const filename = `slide-${i}.html`;
    const filepath = path.join(slidesDir, filename);

    if (fs.existsSync(filepath)) {
        const content = fs.readFileSync(filepath, 'utf8');

        // Check for class="slide"
        if (!content.includes('class="slide"')) {
            issues.push(`${filename}: Missing class="slide"`);
            console.log(`   ✗ ${filename} - Missing class="slide"`);
        }

        // Check for id attribute
        const idMatch = content.match(/id="slide-(\d+)"/);
        if (!idMatch) {
            issues.push(`${filename}: Missing or invalid id attribute`);
            console.log(`   ✗ ${filename} - Missing id attribute`);
        } else if (parseInt(idMatch[1]) !== i) {
            issues.push(`${filename}: ID mismatch (has slide-${idMatch[1]}, expected slide-${i})`);
            console.log(`   ✗ ${filename} - ID mismatch (has slide-${idMatch[1]})`);
        }

        // Check for unclosed tags
        const openDivs = (content.match(/<div/g) || []).length;
        const closeDivs = (content.match(/<\/div>/g) || []).length;
        if (openDivs !== closeDivs) {
            issues.push(`${filename}: Unclosed div tags (${openDivs} open, ${closeDivs} close)`);
            console.log(`   ✗ ${filename} - Unclosed div tags`);
        }
    }
}

// 5. Summary
console.log('\n=== SUMMARY ===');
if (issues.length === 0) {
    console.log('✓ No issues found! All slides are properly configured.');
} else {
    console.log(`✗ Found ${issues.length} issue(s):\n`);
    issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue}`);
    });
}

console.log('\n=== END OF REPORT ===');
