// VALIDASI DATA CONSISTENCY CHECKER
// Paste this in browser console to check data consistency

console.log("=== 🔍 CHECKING DATA CONSISTENCY ===\n");

// 1. Check localStorage submissions
const submissions = JSON.parse(localStorage.getItem("submissions") || "[]");
console.log(`📊 Total submissions in localStorage: ${submissions.length}\n`);

// 2. Apply dashboard filter logic
const dashboardValidationCount = submissions.filter(s => 
  s.workflowStage === "validation" && 
  !s.isOutputValidated && 
  s.isConfirmed !== false
).length;

// 3. Apply original simple validation filter
const simpleValidationCount = submissions.filter(s => 
  s.workflowStage === "validation"
).length;

// 4. Show detailed breakdown
console.log("📋 WORKFLOW STAGE BREAKDOWN:");
const stageBreakdown = submissions.reduce((acc, sub) => {
  const stage = sub.workflowStage || 'undefined';
  acc[stage] = (acc[stage] || 0) + 1;
  return acc;
}, {});

Object.entries(stageBreakdown).forEach(([stage, count]) => {
  console.log(`   ${stage}: ${count}`);
});

console.log("\n🎯 VALIDATION FILTERING COMPARISON:");
console.log(`   Dashboard logic (strict): ${dashboardValidationCount}`);
console.log(`   Simple filter: ${simpleValidationCount}`);

if (dashboardValidationCount !== simpleValidationCount) {
  console.log("\n❌ INCONSISTENCY DETECTED!");
  console.log("Items with workflow_stage='validation' but filtered out:");
  
  const validationItems = submissions.filter(s => s.workflowStage === "validation");
  validationItems.forEach((sub, i) => {
    const passesStrictFilter = !sub.isOutputValidated && sub.isConfirmed !== false;
    console.log(`   ${i+1}. "${sub.judul}" (ID: ${sub.id})`);
    console.log(`      ├─ isOutputValidated: ${sub.isOutputValidated}`);
    console.log(`      ├─ isConfirmed: ${sub.isConfirmed}`);
    console.log(`      └─ Passes strict filter: ${passesStrictFilter ? '✅' : '❌'}`);
  });
} else {
  console.log("\n✅ Data is consistent!");
}

// 5. Check validation cache
const validationCache = JSON.parse(localStorage.getItem("validations_cache") || "[]");
console.log(`\n📦 Validation cache: ${validationCache.length} items`);

// 6. Recommend action
console.log("\n💡 RECOMMENDATIONS:");
if (dashboardValidationCount !== simpleValidationCount) {
  console.log("1. Dashboard is using stricter filter - this is correct");
  console.log("2. Validation page should use same filter logic");
  console.log("3. Check if isOutputValidated and isConfirmed are set correctly");
} else {
  console.log("1. Filters are consistent");
  console.log("2. If still seeing differences, check API vs localStorage sync");
}

console.log("\n🔧 QUICK FIX:");
console.log("localStorage.setItem('validations_cache', JSON.stringify(");
console.log("  JSON.parse(localStorage.getItem('submissions') || '[]')");
console.log("    .filter(s => s.workflowStage === 'validation' && !s.isOutputValidated && s.isConfirmed !== false)");
console.log("));");
console.log("// Then refresh the validation page");
