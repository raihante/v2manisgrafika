// Run verify.mjs for several source/local pairs in one ego session.
// Input: reference/verify/batch.json -> {"widths":[1920,390],"pairs":[{"out":"pdp-xs-dumpling","path":"/products/xs-dumpling-bag"}]}
// Each pair writes reference/verify/<out>/; score each with: python tests/visual/score.py reference/verify/<out> 1920,390 local
const fs = await import("node:fs/promises");
const ROOT = "C:/Digitakarya/v2manisgrafika";
const batch = JSON.parse(await fs.readFile(`${ROOT}/reference/verify/batch.json`, "utf8"));
for (const [i, pair] of batch.pairs.entries()) {
  const cfg = { out: pair.out, widths: batch.widths, height: 900, targets: [
    { label: "source", source: true, url: `https://beyondthevines.co.id${pair.path}` },
    { label: "local", url: `http://localhost:3400${pair.path}/` },
  ] };
  await fs.writeFile(`${ROOT}/reference/verify/verify-cfg.json`, JSON.stringify(cfg, null, 1));
  console.log("==", pair.out);
  await import(`file:///${ROOT}/tests/visual/verify.mjs?run=${Date.now()}-${i}`);
}
