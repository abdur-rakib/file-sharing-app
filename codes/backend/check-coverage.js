import fs from "fs";

const summary = JSON.parse(
  fs.readFileSync("coverage/coverage-summary.json", "utf8")
);
console.log("🚀 ~ summary:", summary);
const total = summary.total;

const average =
  (total.lines.pct +
    total.statements.pct +
    total.functions.pct +
    total.branches.pct) /
  4;
console.log("🚀 ~ average:", average);

console.log(`📊 Average Coverage: ${average.toFixed(2)}%`);

if (average < 50) {
  console.error("❌ Coverage is below 50%");
  process.exit(1);
}
