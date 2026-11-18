import "./setup.js";
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveUploadPath, looksScanned } from "../middleware/processPDF.js";
import { requireAuth } from "../middleware/auth.js";
import { requireSessionOwner } from "../middleware/sessionOwner.js";

function fakeRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test("upload paths can't escape the uploads folder", () => {
  for (const name of ["../../.env", "../config.js", "/etc/passwd", ""]) {
    assert.throws(() => resolveUploadPath(name), { status: 404 });
  }
});

test("requests without a sign-in token are rejected", async () => {
  const res = fakeRes();
  let calledNext = false;
  await requireAuth({ headers: {} }, res, () => { calledNext = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(calledNext, false);
});

test("requests with a malformed token are rejected", async () => {
  const res = fakeRes();
  await requireAuth({ headers: { authorization: "Bearer not-a-real-token" } }, res, () => {});
  assert.equal(res.statusCode, 401);
});

test("an invalid session ID is rejected before touching the database", async () => {
  const res = fakeRes();
  const check = requireSessionOwner((req) => req.body.learningSessionId);
  await check({ body: { learningSessionId: "not-an-id" }, user: { uid: "u1" } }, res, () => {});
  assert.equal(res.statusCode, 400);
});

test("PDFs with almost no text are treated as scanned", () => {
  assert.equal(looksScanned([]), true);
  assert.equal(looksScanned([{ pageContent: "  " }, { pageContent: "x" }]), true);
  assert.equal(looksScanned([{ pageContent: "a".repeat(400) }]), false);
});
