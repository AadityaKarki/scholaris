import "./setup.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildContext, citedSources, formatSources } from "../middleware/retrieveAnswers.js";

const docs = [
  { pageContent: "Mitochondria produce ATP.", metadata: { pageNumber: 3, source: "Biology" } },
  { pageContent: "Ribosomes build proteins.", metadata: { pageNumber: 7, source: "Biology" } },
];

test("excerpts are numbered and labelled with their page", () => {
  const { context, sources } = buildContext(docs);
  assert.match(context, /^\[1\] \(page 3\)\nMitochondria/);
  assert.match(context, /\[2\] \(page 7\)\nRibosomes/);
  assert.deepEqual(sources.map((s) => s.ref), [1, 2]);
});

test("only the excerpts the answer cites are listed as sources", () => {
  const { sources } = buildContext(docs);
  const used = citedSources("ATP is made in the mitochondria [1].", sources);
  assert.deepEqual(used.map((s) => s.page), [3]);
  assert.equal(formatSources(used), "\n\n**Sources:** [1] page 3");
  assert.equal(formatSources([]), "");
});
