import assert from "node:assert/strict";
import test from "node:test";
import { getClientIdFromBody, parseOptionalDate } from "../utils/projectValidation.js";
test("normalizes supported client identifier fields", () => {
    assert.equal(getClientIdFromBody({ clientId: "client-a" }), "client-a");
    assert.equal(getClientIdFromBody({ client: "client-b" }), "client-b");
    assert.equal(getClientIdFromBody({ client_id: "client-c" }), "client-c");
    assert.equal(getClientIdFromBody({ clientId: { _id: "client-d", name: "Acme" } }), "client-d");
});
test("prefers clientId over legacy client fields", () => {
    assert.equal(getClientIdFromBody({ clientId: "canonical", client: "legacy", client_id: "legacy_two" }), "canonical");
});
test("parses optional deadlines safely", () => {
    assert.equal(parseOptionalDate(undefined), undefined);
    assert.equal(parseOptionalDate(""), null);
    assert.equal(parseOptionalDate("not-a-date"), "invalid");
    const parsed = parseOptionalDate("2026-10-05");
    assert.ok(parsed instanceof Date);
    assert.equal(parsed.toISOString().slice(0, 10), "2026-10-05");
});
//# sourceMappingURL=projectValidation.test.js.map