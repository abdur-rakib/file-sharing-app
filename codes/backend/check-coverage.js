import fs from "fs";

try {
  const summary = JSON.parse(
    fs.readFileSync("coverage/coverage-summary.json", "utf8")
  );
  const total = summary.total;

  const average =
    (total.lines.pct +
      total.statements.pct +
      total.functions.pct +
      total.branches.pct) /
    4;

  console.log(`📊 Average Coverage: ${average.toFixed(2)}%`);

  if (average < 70) {
    console.error("⚠️ Coverage is below 70%");
    process.exit(0);
  }
} catch (err) {
  console.error("❌ Failed to read coverage summary:", err);
  process.exit(1);
}
