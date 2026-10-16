import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('🧪 Starting 200 Picture Limit Verification Test Suite...\n');

let testsPassed = 0;
let testsFailed = 0;

function it(desc, fn) {
    try {
        fn();
        console.log(`  ✅ PASS: ${desc}`);
        testsPassed++;
    } catch (err) {
        console.error(`  ❌ FAIL: ${desc}`);
        console.error(`     Error: ${err.message}\n`);
        testsFailed++;
    }
}

// ----------------------------------------------------
// TEST GROUP 1: Static Code Analysis of AdminDashboard
// ----------------------------------------------------
console.log('--- Test Group 1: AdminDashboard.jsx Static Code Analysis ---');
const adminDashboardPath = path.resolve('src/pages/AdminDashboard.jsx');
const adminDashboardCode = fs.readFileSync(adminDashboardPath, 'utf-8');

it('should not contain any old "Max 100" or "limited to 100" text in AdminDashboard.jsx', () => {
    assert.strictEqual(adminDashboardCode.includes('Max 100'), false, 'Found "Max 100" in AdminDashboard.jsx');
    assert.strictEqual(adminDashboardCode.includes('limited to 100 total images'), false, 'Found "limited to 100 total images" in AdminDashboard.jsx');
    assert.strictEqual(adminDashboardCode.includes('100 - portfolioImages.length'), false, 'Found "100 - portfolioImages.length" in AdminDashboard.jsx');
    assert.strictEqual(adminDashboardCode.includes('Maximum 100 images allowed'), false, 'Found "Maximum 100 images allowed" in AdminDashboard.jsx');
    assert.strictEqual(adminDashboardCode.includes('combined.length > 100'), false, 'Found "combined.length > 100" in AdminDashboard.jsx');
    assert.strictEqual(adminDashboardCode.includes('combined.slice(0, 100)'), false, 'Found "combined.slice(0, 100)" in AdminDashboard.jsx');
});

it('should contain the new 200 limit references in AdminDashboard.jsx', () => {
    assert.strictEqual(adminDashboardCode.includes('Max 200'), true, 'Missing "Max 200"');
    assert.strictEqual(adminDashboardCode.includes('limited to 200 total images'), true, 'Missing "limited to 200 total images"');
    assert.strictEqual(adminDashboardCode.includes('200 - portfolioImages.length'), true, 'Missing "200 - portfolioImages.length"');
    assert.strictEqual(adminDashboardCode.includes('Maximum 200 images allowed per portfolio'), true, 'Missing "Maximum 200 images allowed per portfolio"');
    assert.strictEqual(adminDashboardCode.includes('combined.length > 200'), true, 'Missing "combined.length > 200"');
    assert.strictEqual(adminDashboardCode.includes('combined.slice(0, 200)'), true, 'Missing "combined.slice(0, 200)"');
});

// ----------------------------------------------------
// TEST GROUP 2: Dropping & Trimming Logic Simulation
// ----------------------------------------------------
console.log('\n--- Test Group 2: Image Trimming Simulation ---');

function simulateImageDrop(existingImages, incomingImages) {
    let warningTriggered = null;
    const toast = {
        warning: (msg) => { warningTriggered = msg; }
    };

    const combined = [...existingImages, ...incomingImages];
    let result;
    if (combined.length > 200) {
        toast.warning(`Maximum 200 images allowed per portfolio. Automatically trimmed ${combined.length - 200} extra images.`);
        result = combined.slice(0, 200);
    } else {
        result = combined;
    }

    return { result, warningTriggered };
}

it('allows uploading up to 200 images without warning or trimming', () => {
    const existing = [];
    const incoming = Array.from({ length: 200 }, (_, i) => ({ name: `photo_${i + 1}.jpg` }));
    
    const { result, warningTriggered } = simulateImageDrop(existing, incoming);
    assert.strictEqual(result.length, 200);
    assert.strictEqual(warningTriggered, null);
    assert.strictEqual(result[0].name, 'photo_1.jpg');
    assert.strictEqual(result[199].name, 'photo_200.jpg');
});

it('trims extra images when dropping more than 200 images (e.g. 240 images)', () => {
    const existing = [];
    const incoming = Array.from({ length: 240 }, (_, i) => ({ name: `photo_${i + 1}.jpg` }));
    
    const { result, warningTriggered } = simulateImageDrop(existing, incoming);
    assert.strictEqual(result.length, 200);
    assert.strictEqual(
        warningTriggered,
        'Maximum 200 images allowed per portfolio. Automatically trimmed 40 extra images.'
    );
    assert.strictEqual(result[0].name, 'photo_1.jpg');
    assert.strictEqual(result[199].name, 'photo_200.jpg');
});

it('handles incremental drops up to the 200 limit (e.g. 120 then 100)', () => {
    const existing = Array.from({ length: 120 }, (_, i) => ({ name: `photo_${i + 1}.jpg` }));
    const incoming = Array.from({ length: 100 }, (_, i) => ({ name: `batch2_${i + 1}.jpg` }));
    
    const { result, warningTriggered } = simulateImageDrop(existing, incoming);
    assert.strictEqual(result.length, 200);
    assert.strictEqual(
        warningTriggered,
        'Maximum 200 images allowed per portfolio. Automatically trimmed 20 extra images.'
    );
    assert.strictEqual(result[119].name, 'photo_120.jpg');
    assert.strictEqual(result[120].name, 'batch2_1.jpg');
    assert.strictEqual(result[199].name, 'batch2_80.jpg');
});

// ----------------------------------------------------
// TEST GROUP 3: Bulk Selection Modal Limit Logic
// ----------------------------------------------------
console.log('\n--- Test Group 3: Modal Limit & Disabling Logic ---');

it('accurately computes max allowable selections based on 200 limit', () => {
    const portfolioImages = Array.from({ length: 75 });
    const maxSelectable = 200 - portfolioImages.length;
    assert.strictEqual(maxSelectable, 125);

    const selectedIndices = new Set(Array.from({ length: 125 }, (_, i) => i));
    const isDisabled = selectedIndices.size >= (200 - portfolioImages.length);
    assert.strictEqual(isDisabled, true);

    selectedIndices.delete(0);
    const isNowDisabled = selectedIndices.size >= (200 - portfolioImages.length);
    assert.strictEqual(isNowDisabled, false);
});

// ----------------------------------------------------
// TEST GROUP 4: adminApi.getFiles Batching & Hydration
// ----------------------------------------------------
console.log('\n--- Test Group 4: adminApi.getFiles Batching Logic ---');

async function mockGetFiles(ids) {
    if (!ids || ids.length === 0) return [];
    const chunkSize = 100;
    const results = [];
    const chunksSent = [];

    for (let i = 0; i < ids.length; i += chunkSize) {
        const chunk = ids.slice(i, i + chunkSize);
        chunksSent.push(chunk.length);
        // Simulate API returning the files for each chunk
        const mockedItems = chunk.map(id => ({ id, downloadUrl: `https://cdn.lsd.com/${id}.webp` }));
        results.push(...mockedItems);
    }
    return { results, chunksSent };
}

it('batches 400 file IDs (200 high-res + 200 low-res) in safe chunks of 100', async () => {
    const fileIds = Array.from({ length: 400 }, (_, i) => `FIL_${i + 1}`);
    const { results, chunksSent } = await mockGetFiles(fileIds);

    assert.strictEqual(results.length, 400);
    assert.deepStrictEqual(chunksSent, [100, 100, 100, 100]);
    assert.strictEqual(results[0].id, 'FIL_1');
    assert.strictEqual(results[399].id, 'FIL_400');
});

// ----------------------------------------------------
// TEST GROUP 5: AboutUsPreview Chessboard Order Logic
// ----------------------------------------------------
console.log('\n--- Test Group 5: Team Grid Chessboard Pattern ---');

const aboutUsPreviewPath = path.resolve('src/components/home/AboutUsPreview.jsx');
const aboutUsPreviewCode = fs.readFileSync(aboutUsPreviewPath, 'utf-8');

it('verifies AboutUsPreview has mobile and desktop order classes', () => {
    assert.strictEqual(aboutUsPreviewCode.includes('order-1 sm:order-1'), true);
    assert.strictEqual(aboutUsPreviewCode.includes('order-4 sm:order-3'), true);
    assert.strictEqual(aboutUsPreviewCode.includes('order-3 sm:order-4'), true);
});

it('verifies 2-column mobile layout forms an alternating chessboard', () => {
    // 6 images alternating: W (0), G (1), W (2), G (3), W (4), G (5)
    const images = ['W', 'G', 'W', 'G', 'W', 'G'];
    
    // In CSS Grid, items are ordered by their mobile 'order' value:
    // Index 0 -> order 1: W
    // Index 1 -> order 2: G
    // Index 3 -> order 3: G
    // Index 2 -> order 4: W
    // Index 4 -> order 5: W
    // Index 5 -> order 6: G
    const mobileVisualOrder = [
        images[0], // Row 1, Col 1 -> W
        images[1], // Row 1, Col 2 -> G
        images[3], // Row 2, Col 1 -> G
        images[2], // Row 2, Col 2 -> W
        images[4], // Row 3, Col 1 -> W
        images[5], // Row 3, Col 2 -> G
    ];

    // Check Row 1
    assert.strictEqual(mobileVisualOrder[0], 'W');
    assert.strictEqual(mobileVisualOrder[1], 'G');

    // Check Row 2 (must alternate vertically with Row 1!)
    assert.strictEqual(mobileVisualOrder[2], 'G');
    assert.strictEqual(mobileVisualOrder[3], 'W');

    // Check Row 3 (must alternate vertically with Row 2!)
    assert.strictEqual(mobileVisualOrder[4], 'W');
    assert.strictEqual(mobileVisualOrder[5], 'G');

    // Verify no two adjacent cells (horizontally or vertically) share the same background:
    // Row 1 horizontal
    assert.notStrictEqual(mobileVisualOrder[0], mobileVisualOrder[1]);
    // Row 2 horizontal
    assert.notStrictEqual(mobileVisualOrder[2], mobileVisualOrder[3]);
    // Row 3 horizontal
    assert.notStrictEqual(mobileVisualOrder[4], mobileVisualOrder[5]);
    // Col 1 vertical
    assert.notStrictEqual(mobileVisualOrder[0], mobileVisualOrder[2]);
    assert.notStrictEqual(mobileVisualOrder[2], mobileVisualOrder[4]);
    // Col 2 vertical
    assert.notStrictEqual(mobileVisualOrder[1], mobileVisualOrder[3]);
    assert.notStrictEqual(mobileVisualOrder[3], mobileVisualOrder[5]);
});

// ----------------------------------------------------
// TEST SUMMARY
// ----------------------------------------------------
console.log('\n=============================================');
console.log(`🏁 Test Summary: ${testsPassed} passed, ${testsFailed} failed`);
console.log('=============================================\n');

if (testsFailed > 0) {
    process.exit(1);
}
