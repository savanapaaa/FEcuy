// DEBUG WORKFLOW TRANSITION CHECKER
// Paste this code in browser console to check current data state

console.log("=== 🔍 WORKFLOW TRANSITION DEBUG ===\n");

// 1. Check submissions in localStorage
const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");
console.log(`📊 Total submissions in localStorage: ${submissions.length}\n`);

// 2. Analyze each submission's workflow stage
console.log("📋 SUBMISSION ANALYSIS:");
submissions.forEach((sub, i) => {
  console.log(`${i+1}. "${sub.judul}"`);
  console.log(`   ├─ ID: ${sub.id}`);
  console.log(`   ├─ Workflow Stage: ${sub.workflowStage || 'undefined'}`);
  console.log(`   ├─ Is Confirmed: ${sub.isConfirmed}`);
  console.log(`   ├─ Review Date: ${sub.tanggalReview || 'none'}`);
  console.log(`   ├─ Is Output Validated: ${sub.isOutputValidated || false}`);
  
  if (sub.contentItems && sub.contentItems.length > 0) {
    console.log(`   ├─ Content Items (${sub.contentItems.length}):`);
    sub.contentItems.forEach((item, idx) => {
      console.log(`   │  ${idx+1}. Status: ${item.status || 'pending'}`);
      console.log(`   │     isTayang: ${item.isTayang !== undefined ? item.isTayang : 'undefined'}`);
      if (item.alasanPenolakan) {
        console.log(`   │     Rejection: ${item.alasanPenolakan}`);
      }
    });
  } else {
    console.log(`   ├─ Content Items: 0 (empty)`);
  }
  console.log(`   └─ Should be in validation: ${shouldBeInValidation(sub)}\n`);
});

// 3. Check validation cache
const validationCache = JSON.parse(localStorage.getItem("validations_cache") || "[]");
console.log(`📊 Validation cache: ${validationCache.length} items\n`);

// 4. Filter for items that should be in validation
console.log("🎯 ITEMS THAT SHOULD BE IN VALIDATION:");
const shouldBeValidated = submissions.filter(shouldBeInValidation);
console.log(`Found ${shouldBeValidated.length} items that should be in validation:`);
shouldBeValidated.forEach((sub, i) => {
  console.log(`${i+1}. "${sub.judul}" (ID: ${sub.id})`);
});

// 5. Helper function to determine if item should be in validation
function shouldBeInValidation(sub) {
  if (!sub.isConfirmed) return false;
  
  const contentItems = sub.contentItems || [];
  if (contentItems.length === 0) return false;
  
  // All content items must be reviewed (approved or rejected)
  const allReviewed = contentItems.every(
    item => item.status === "approved" || item.status === "rejected"
  );
  if (!allReviewed) return false;
  
  // Must have at least one approved item
  const hasApprovedItems = contentItems.some(item => item.status === "approved");
  if (!hasApprovedItems) return false;
  
  // Approved items should not be validated yet
  const approvedItems = contentItems.filter(item => item.status === "approved");
  const allValidated = approvedItems.every(item => item.isTayang !== undefined);
  
  // Should be in validation if not all approved items are validated
  return !allValidated && !sub.isOutputValidated;
}

console.log("\n=== 🔧 POTENTIAL FIXES ===");
console.log("1. Check if workflowStage is properly updated after review");
console.log("2. Verify that approved items transition to validation");  
console.log("3. Ensure validation page reads the correct data source");
console.log("4. Check if API sync is working properly");

console.log("\n=== 📝 NEXT STEPS ===");
console.log("1. Review the handleUpdate function in review page");
console.log("2. Check validation page data loading logic");
console.log("3. Verify workflow stage calculation");
console.log("4. Test API endpoints for data consistency");
