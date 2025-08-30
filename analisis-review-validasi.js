// ANALISIS MASALAH REVIEW → VALIDASI
// Paste script ini di browser console untuk menganalisis mengapa hanya 2 dari 4 reviewed items yang masuk ke validasi

console.log("=== 🔍 ANALISIS REVIEW → VALIDASI ===\n");

const submissions = JSON.parse(localStorage.getItem('submissions') || '[]');
console.log(`📊 Total submissions: ${submissions.length}\n`);

// 1. Cari semua item yang sudah di-review
const reviewedItems = submissions.filter(sub => {
    const contentItems = sub.contentItems || [];
    if (contentItems.length === 0) return false;
    
    // Cek apakah semua content items sudah di-review (ada status approved/rejected)
    const allReviewed = contentItems.every(item => 
        item.status === "approved" || item.status === "rejected"
    );
    
    return allReviewed && sub.isConfirmed;
});

console.log(`📋 Items yang sudah di-review lengkap: ${reviewedItems.length}`);

if (reviewedItems.length > 0) {
    console.log("\nDetail items yang sudah di-review:");
    reviewedItems.forEach((sub, i) => {
        const contentItems = sub.contentItems || [];
        const approvedCount = contentItems.filter(item => item.status === "approved").length;
        const rejectedCount = contentItems.filter(item => item.status === "rejected").length;
        
        console.log(`${i+1}. "${sub.judul}" (ID: ${sub.id})`);
        console.log(`   ├─ Current Stage: ${sub.workflowStage}`);
        console.log(`   ├─ Review Date: ${sub.tanggalReview || 'Not set'}`);
        console.log(`   ├─ Content Items: ${contentItems.length} (${approvedCount} approved, ${rejectedCount} rejected)`);
        console.log(`   ├─ isConfirmed: ${sub.isConfirmed}`);
        console.log(`   ├─ isOutputValidated: ${sub.isOutputValidated}`);
        
        // Tentukan apakah seharusnya masuk ke validasi
        const hasApproved = approvedCount > 0;
        const shouldBeInValidation = hasApproved && !sub.isOutputValidated;
        
        console.log(`   ├─ Should be in validation: ${shouldBeInValidation ? '✅ YES' : '❌ NO'}`);
        console.log(`   └─ Reason: ${getValidationReason(sub, hasApproved)}\n`);
    });
}

// 2. Cari yang seharusnya masuk validasi
const shouldBeInValidation = reviewedItems.filter(sub => {
    const contentItems = sub.contentItems || [];
    const hasApproved = contentItems.some(item => item.status === "approved");
    return hasApproved && !sub.isOutputValidated;
});

console.log(`🎯 Yang seharusnya masuk validasi: ${shouldBeInValidation.length}`);

// 3. Cari yang ada di cache validasi
const validationCache = JSON.parse(localStorage.getItem('validations_cache') || '[]');
console.log(`📦 Yang ada di validation cache: ${validationCache.length}`);

// 4. Bandingkan dan temukan yang hilang
const missingFromValidation = shouldBeInValidation.filter(sub => 
    !validationCache.find(cached => cached.id === sub.id)
);

if (missingFromValidation.length > 0) {
    console.log(`\n❌ MASALAH DITEMUKAN: ${missingFromValidation.length} items hilang dari validasi!`);
    console.log("\nItems yang hilang:");
    missingFromValidation.forEach((sub, i) => {
        console.log(`${i+1}. "${sub.judul}" (ID: ${sub.id})`);
        console.log(`   ├─ Stage: ${sub.workflowStage} (should be 'validation')`);
        console.log(`   └─ Problem: ${getDiagnostic(sub)}`);
    });
    
    console.log("\n🔧 SOLUSI:");
    console.log("1. Perbaiki workflow stage untuk items yang hilang");
    console.log("2. Update validation cache");
    console.log("3. Refresh halaman validasi");
} else {
    console.log("\n✅ Semua reviewed items sudah masuk ke validasi dengan benar");
}

function getValidationReason(sub, hasApproved) {
    if (!hasApproved) return "Tidak ada content yang di-approve";
    if (sub.isOutputValidated) return "Sudah divalidasi output";
    if (sub.workflowStage !== "validation") return `Workflow stage salah (${sub.workflowStage})`;
    return "Should be in validation";
}

function getDiagnostic(sub) {
    const issues = [];
    if (sub.workflowStage !== "validation") issues.push(`Stage = ${sub.workflowStage}`);
    if (sub.isOutputValidated) issues.push("Already validated");
    if (!sub.isConfirmed) issues.push("Not confirmed");
    return issues.length > 0 ? issues.join(", ") : "Unknown issue";
}

console.log("\n💡 QUICK FIX:");
console.log("Jika ada items yang hilang, jalankan:");
console.log("fixMissingValidationItems(); // Function akan dibuat setelah analisis");
