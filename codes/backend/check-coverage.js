// codes/backend/check-coverage.js
const fs = require("fs");
const path = require("path");

const COVERAGE_FILE = path.join(__dirname, "coverage", "coverage-summary.json");

// Coverage thresholds
const MINIMUM_COVERAGE = {
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80,
};

// Average coverage threshold
const MINIMUM_AVERAGE_COVERAGE = 10; // Average of all metrics should be at least 78%

function validateCoverageFile() {
  if (!fs.existsSync(COVERAGE_FILE)) {
    console.error("❌ Coverage summary file not found at:", COVERAGE_FILE);
    process.exit(1);
  }
}

function loadCoverageData() {
  try {
    return JSON.parse(fs.readFileSync(COVERAGE_FILE, "utf8"));
  } catch (error) {
    console.error("❌ Failed to parse coverage data:", error.message);
    process.exit(1);
  }
}

function displayCoverageReport(coverageData) {
  const { total } = coverageData;

  console.log("\n📊 Test Coverage Analysis");
  console.log("=".repeat(50));
  console.log(
    `📈 Lines:      ${total.lines.pct}% (${total.lines.covered}/${total.lines.total})`
  );
  console.log(
    `🔧 Functions:  ${total.functions.pct}% (${total.functions.covered}/${total.functions.total})`
  );
  console.log(
    `🌿 Branches:   ${total.branches.pct}% (${total.branches.covered}/${total.branches.total})`
  );
  console.log(
    `📝 Statements: ${total.statements.pct}% (${total.statements.covered}/${total.statements.total})`
  );
  console.log("=".repeat(50));

  return total;
}

function validateThresholds(coverageTotals) {
  // Calculate average coverage
  const metrics = Object.keys(MINIMUM_COVERAGE);
  const totalCoverage = metrics.reduce((sum, metric) => {
    return sum + coverageTotals[metric].pct;
  }, 0);

  const averageCoverage = (totalCoverage / metrics.length).toFixed(2);
  const averagePassed = parseFloat(averageCoverage) >= MINIMUM_AVERAGE_COVERAGE;

  console.log("\n📊 Average Coverage Analysis:");
  console.log("=".repeat(40));
  console.log(`📈 Average Coverage: ${averageCoverage}%`);
  console.log(`🎯 Required Average: ${MINIMUM_AVERAGE_COVERAGE}%`);
  console.log(
    `${averagePassed ? "✅" : "❌"} Status: ${averagePassed ? "PASSED" : "FAILED"}`
  );
  console.log("=".repeat(40));

  return averagePassed;
}

function main() {
  validateCoverageFile();
  const coverageData = loadCoverageData();
  const totals = displayCoverageReport(coverageData);
  const passed = validateThresholds(totals);

  if (passed) {
    console.log("\n🎉 All coverage thresholds met successfully!");
    process.exit(0);
  } else {
    console.log("\n💥 Coverage validation failed - some thresholds not met");
    process.exit(1);
  }
}

main();
