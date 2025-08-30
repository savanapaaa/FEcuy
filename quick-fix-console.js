// QUICK FIX untuk memastikan semua reviewed items masuk ke validasi
// Copy-paste script ini ke browser console (F12)

console.log("🔧 QUICK FIX: Review → Validasi");

// 1. Ambil data submissions
const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
console.log(`📊 Total submissions: ${submissions.length}`);

// 2. Cari semua items yang sudah di-review lengkap
const reviewedItems = submissions.filter(sub => {
    if (!sub.isConfirmed) return false;
    
    const contentItems = sub.contentItems || [];
    if (contentItems.length === 0) return false;
    
    // Semua content items harus punya status (reviewed)
    const allReviewed = contentItems.every(item => 
        item.status === "approved" || item.status === "rejected"
    );
    
    if (!allReviewed) return false;
    
    // Harus ada minimal 1 yang di-approve
    const hasApproved = contentItems.some(item => item.status === "approved");
    return hasApproved;
});

console.log(`📝 Items yang sudah di-review: ${reviewedItems.length}`);

// 3. Perbaiki workflow stage untuk reviewed items
let fixedCount = 0;
const fixedSubmissions = submissions.map(sub => {
    const reviewedItem = reviewedItems.find(reviewed => reviewed.id === sub.id);
    
    if (reviewedItem && sub.workflowStage !== "validation") {
        fixedCount++;
        console.log(`🔧 Fixed: "${sub.judul}" ${sub.workflowStage} → validation`);
        
        return {
            ...sub,
            workflowStage: "validation",
            isOutputValidated: false, // Pastikan belum divalidasi output
            tanggalReview: sub.tanggalReview || new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
    }
    
    return sub;
});

// 4. Update localStorage submissions
localStorage.setItem('submissions', JSON.stringify(fixedSubmissions));

// 5. Update validation cache dengan semua items yang perlu validasi
const validationItems = fixedSubmissions.filter(sub => 
    sub.workflowStage === "validation" && 
    !sub.isOutputValidated &&
    sub.isConfirmed !== false
);

localStorage.setItem('validations_cache', JSON.stringify(validationItems));

// 6. Report hasil
console.log(`✅ PERBAIKAN SELESAI:`);
console.log(`   - Fixed workflow stages: ${fixedCount} items`);
console.log(`   - Items in validation: ${validationItems.length}`);
console.log(`   - Ready for validation page!`);

console.log(`\n📋 Items yang sekarang di validasi:`);
validationItems.forEach((item, i) => {
    console.log(`${i+1}. "${item.judul}" (ID: ${item.id})`);
});

console.log(`\n🎯 SELANJUTNYA:`);
console.log(`1. Refresh halaman validasi`);
console.log(`2. Anda harus melihat ${validationItems.length} items`);
console.log(`3. Dashboard dan validasi page sekarang konsisten`);

// Return data untuk verifikasi
console.log(`\n🔍 VERIFIKASI:`);
console.log("reviewedItems:", reviewedItems.length);
console.log("validationItems:", validationItems.length);
console.log("Should be equal:", reviewedItems.length === validationItems.length ? "✅ YES" : "❌ NO");
