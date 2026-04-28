import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { sanitizeHtml } from "./sanitize.ts";

describe("sanitizeHtml — XSS payloads", () => {
  it("strips <script> tags", () => {
    const out = sanitizeHtml('<p>hola</p><script>alert("xss")</script>');
    assert.equal(out.includes("<script"), false);
    assert.equal(out.includes("alert"), false);
    assert.ok(out.includes("<p>hola</p>"));
  });

  it("strips inline event handlers like onerror", () => {
    const out = sanitizeHtml('<img src="x" onerror="alert(1)">');
    assert.equal(out.includes("onerror"), false);
    assert.equal(out.includes("alert"), false);
  });

  it("blocks javascript: hrefs", () => {
    const out = sanitizeHtml('<a href="javascript:alert(1)">click</a>');
    assert.equal(out.includes("javascript:"), false);
  });

  it("blocks data: URIs in href", () => {
    const out = sanitizeHtml('<a href="data:text/html,<script>alert(1)</script>">x</a>');
    assert.equal(out.includes("data:text/html"), false);
    assert.equal(out.includes("<script"), false);
  });

  it("removes <iframe> entirely", () => {
    const out = sanitizeHtml('<iframe src="https://evil.example"></iframe>');
    assert.equal(out.includes("<iframe"), false);
  });

  it("removes <style> and <svg> based vectors", () => {
    const out = sanitizeHtml(
      '<svg><style>@keyframes x{}</style><circle onclick="alert(1)"/></svg>'
    );
    assert.equal(out.includes("<svg"), false);
    assert.equal(out.includes("<style"), false);
    assert.equal(out.includes("onclick"), false);
  });

  it("strips disallowed tags but keeps text", () => {
    const out = sanitizeHtml("<form><input value=x><p>texto</p></form>");
    assert.equal(out.includes("<form"), false);
    assert.equal(out.includes("<input"), false);
    assert.ok(out.includes("<p>texto</p>"));
  });
});

describe("sanitizeHtml — whitelist (allowed tags)", () => {
  const allowedExamples: Array<[string, string]> = [
    ["h2", "<h2>t</h2>"],
    ["h3", "<h3>t</h3>"],
    ["p", "<p>t</p>"],
    ["ul/li", "<ul><li>a</li></ul>"],
    ["ol/li", "<ol><li>a</li></ol>"],
    ["blockquote", "<blockquote>q</blockquote>"],
    ["strong", "<strong>x</strong>"],
    ["em", "<em>x</em>"],
    ["br", "<p>a<br>b</p>"],
    ["hr", "<hr>"],
  ];

  for (const [name, html] of allowedExamples) {
    it(`preserves ${name}`, () => {
      const out = sanitizeHtml(html);
      const tag = name.split("/")[0];
      assert.ok(out.includes(`<${tag}`), `expected <${tag} in output: ${out}`);
    });
  }
});

describe("sanitizeHtml — per-tag attribute whitelist", () => {
  it("auto-adds rel=noopener noreferrer on <a>", () => {
    const out = sanitizeHtml('<a href="https://example.com">x</a>');
    assert.match(out, /<a [^>]*href="https:\/\/example\.com"[^>]*>/);
    assert.match(out, /rel="noopener noreferrer"/);
  });

  it("strips target and other attrs from <a>", () => {
    const out = sanitizeHtml(
      '<a href="https://example.com" target="_blank" id="foo" class="bar">x</a>'
    );
    assert.equal(out.includes("target="), false);
    assert.equal(out.includes(' id="'), false);
    assert.equal(out.includes(' class="'), false);
    assert.match(out, /rel="noopener noreferrer"/);
  });

  it("keeps src and alt on <img>, drops everything else", () => {
    const out = sanitizeHtml(
      '<img src="https://cdn.example/x.png" alt="ok" width="100" onload="alert(1)" id="z">'
    );
    assert.match(out, /src="https:\/\/cdn\.example\/x\.png"/);
    assert.match(out, /alt="ok"/);
    assert.equal(out.includes("width="), false);
    assert.equal(out.includes("onload"), false);
    assert.equal(out.includes(' id="'), false);
  });

  it("strips attributes from non-anchor/non-image tags", () => {
    const out = sanitizeHtml('<p id="a" class="b" data-x="c" style="color:red">t</p>');
    assert.equal(out.includes(' id="'), false);
    assert.equal(out.includes(' class="'), false);
    assert.equal(out.includes("data-x"), false);
    assert.equal(out.includes("style="), false);
    assert.ok(out.includes("<p>t</p>"));
  });
});
