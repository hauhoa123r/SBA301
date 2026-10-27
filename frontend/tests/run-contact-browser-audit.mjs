// Local Chrome + intercepted API fixtures. Never submits feedback to the live website.
// Run after npm ci: node frontend/tests/run-contact-browser-audit.mjs
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { createServer } from "node:net";
import assert from "node:assert/strict";

const frontend = resolve(import.meta.dirname, "..");
const artifacts = resolve("backend/target/contact-browser");
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(resolve(artifacts, "chrome-"));
const sleep = ms => new Promise(done => setTimeout(done, ms));
async function freePort() {
  const server = createServer(); await new Promise(done => server.listen(0, "127.0.0.1", done));
  const port = server.address().port; await new Promise(done => server.close(done)); return port;
}
async function until(fn, label) {
  const end = Date.now() + 30000;
  while (Date.now() < end) { try { if (await fn()) return; } catch { /* Startup. */ } await sleep(100); }
  throw new Error("Timed out: " + label);
}
const port = await freePort(), chromePort = await freePort(), base = `http://127.0.0.1:${port}`;
const vite = spawn(process.execPath, [resolve(frontend, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { cwd: frontend, windowsHide: true, stdio: "ignore" });
const chrome = spawn(process.env.CONTACT_AUDIT_CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-background-networking", "--disable-component-update", "--no-first-run", `--remote-debugging-port=${chromePort}`, `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: "ignore" });
let socket, admin = false, sendCode = 201, submissions = 0, status = "NEW", visual = false;
const errors = [], submitted = [], evidence = [];
const legacyRequests = [];
const taxonomy = [
  ["COURSE_SUPPORT", "Hỗ trợ khóa học"], ["SUBSCRIPTION", "Gói đăng ký và thanh toán"],
  ["TECHNICAL", "Sự cố kỹ thuật"], ["WEBSITE", "Góp ý về website"], ["OTHER", "Khác"],
];
function messages() {
  const first = { id: 1, fullName: "Nguyễn Minh Anh", email: "minhanh@example.test", topic: "Góp ý về website", message: visual ? "Website dễ sử dụng và nội dung bài học rất hữu ích. Mình mong có thêm chế độ luyện từ vựng để ôn tập sau mỗi buổi học. Cảm ơn đội ngũ Edujar!" : maliciousText, status, createdAt: "2026-10-27T07:30:00Z" };
  return visual ? [first,
    { ...first, id: 2, fullName: "Trần Hoàng Nam", email: "hoangnam@example.test", topic: "Hỗ trợ khóa học", message: "Mình muốn tìm hiểu thêm về khóa tiếng Trung cho nhân viên Sales. Khóa học có phù hợp với người mới bắt đầu không?" },
    { ...first, id: 3, fullName: "Lê Thảo Nguyên", email: "thaonguyen@example.test", topic: "Gói đăng ký và thanh toán", status: "RESOLVED", message: "Mình đã thanh toán thành công và truy cập được khóa học. Cảm ơn đội ngũ hỗ trợ đã phản hồi rất nhanh." },
  ] : [first];
}
function statistics() {
  const rows = messages();
  return { totalReceived: rows.length, unreadCount: rows.filter(m => m.status === "NEW").length, resolvedCount: rows.filter(m => m.status === "RESOLVED").length,
    categories: taxonomy.map(([category, label]) => {
      const items = rows.filter(m => (taxonomy.find(c => c[1] === m.topic)?.[0] ?? "OTHER") === category);
      return { category, label, total: items.length, unread: items.filter(m => m.status === "NEW").length, resolved: items.filter(m => m.status === "RESOLVED").length };
    }) };
}
const maliciousText = '<img src=x onerror="window.contactXss=true"> Góp ý tiếng Việt 中文';
function fixture(url, method, body) {
  const path = url.pathname;
  if (path === "/api/auth/csrf") return [200, { token: "local-fixture" }];
  if (path === "/api/auth/refresh") return admin ? [200, { accessToken: "local-fixture", user: { id: 1, fullName: "Fixture admin", email: "admin@example.test", roles: ["ADMIN"] } }] : [401, {}];
  if (path === "/api/feedback/current") return [200, null];
  if (path === "/api/contact" && method === "POST") { submissions++; submitted.push(JSON.parse(body)); return [sendCode, sendCode === 201 ? { id: 1 } : { message: "Fixture failure" }]; }
  if (path === "/api/admin/contact-messages/1/status" && method === "PATCH") { status = JSON.parse(body).status; return [200, {}]; }
  if (path === "/api/admin/contact-messages/statistics") return [200, statistics()];
  if (path === "/api/admin/contact-messages") {
    const selected = url.searchParams.get("status");
    const category = url.searchParams.get("category");
    const content = messages().filter(m => (!selected || m.status === selected) && (!category || (taxonomy.find(c => c[1] === m.topic)?.[0] ?? "OTHER") === category));
    return [200, { content, totalElements: content.length, totalPages: 1, page: 0, unreadCount: status === "NEW" ? 1 : 0 }];
  }
  if (path.startsWith("/api/admin/feedback")) { legacyRequests.push(path); return [404, {}]; }
  return [404, {}];
}
try {
  await until(async () => (await fetch(base)).ok, "Vite");
  await until(async () => (await fetch(`http://127.0.0.1:${chromePort}/json/version`)).ok, "Chrome");
  const target = await (await fetch(`http://127.0.0.1:${chromePort}/json/new?about:blank`, { method: "PUT" })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; });
  let id = 0; const pending = new Map();
  function send(method, params = {}) {
    return new Promise((done, fail) => {
      const key = ++id; pending.set(key, { done, fail }); socket.send(JSON.stringify({ id: key, method, params }));
      setTimeout(() => { if (pending.delete(key)) fail(new Error("CDP timeout: " + method)); }, 20000).unref();
    });
  }
  socket.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id) { const item = pending.get(msg.id); pending.delete(msg.id); if (msg.error) item?.fail(new Error(msg.error.message)); else item?.done(msg.result); }
    if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails.text);
    if (msg.method === "Fetch.requestPaused") {
      const { requestId, request } = msg.params;
      const [responseCode, body] = fixture(new URL(request.url), request.method, request.postData);
      void send("Fetch.fulfillRequest", { requestId, responseCode, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(body)).toString("base64") });
    }
  };
  const evaluate = async expression => { const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); assert.ok(!r.exceptionDetails, JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const text = () => evaluate("document.body.innerText");
  async function click(label) { assert.equal(await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)return false;b.click();return true})()`), true, label); }
  async function fill() { await evaluate(`(()=>{document.querySelector('#contact-name').value=' Người dùng ';document.querySelector('#contact-email').value='sender@example.test';document.querySelector('#contact-message').value=' Nội dung tiếng Việt 中文 ';return true})()`); }
  await send("Page.enable"); await send("Runtime.enable");
  await send("Fetch.enable", { patterns: [{ urlPattern: `${base}/api/*` }] });
  await send("Page.navigate", { url: base + "/contact" });
  await until(() => evaluate("!!document.querySelector('#contact-message')"), "Contact form");
  assert.deepEqual(await evaluate("[...document.querySelector('#contact-topic').options].map(o=>o.textContent)"), taxonomy.map(c => c[1]));
  await click("Gửi tin nhắn"); await sleep(150); assert.equal(submissions, 0);
  await fill(); await click("Gửi tin nhắn");
  await until(async () => (await text()).includes("Đã gửi phản hồi thành công"), "Receipt");
  assert.equal(submissions, 1); assert.equal(submitted[0].fullName, "Người dùng");
  assert.equal(await evaluate("document.querySelector('#contact-message').value"), "");
  sendCode = 500; await fill(); await click("Gửi tin nhắn");
  await until(async () => (await text()).includes("Fixture failure"), "Failure feedback");
  assert.ok(await evaluate("document.querySelector('#contact-message').value.includes('tiếng Việt')"));
  sendCode = 429; await click("Gửi tin nhắn");
  await until(async () => (await text()).includes("10 phút"), "Rate limit message");
  evidence.push("PASS: guest form validates, posts trimmed fields, resets after success, preserves text on error, and explains throttling.");
  admin = true;
  await send("Page.navigate", { url: base + "/admin/feedback" });
  await until(async () => (await text()).includes(maliciousText), "Admin inbox");
  assert.equal(await evaluate("window.contactXss===true || !!document.querySelector('.feedback-message img')"), false);
  assert.ok(!(await text()).includes("Tạo đợt mới"));
  await click("Đánh dấu đã xử lý");
  await until(async () => (await text()).includes("0 phản hồi chưa xử lý"), "Resolved");
  assert.equal(status, "RESOLVED");
  await click("Đánh dấu chưa xử lý");
  await until(async () => (await text()).includes("1 phản hồi chưa xử lý"), "Reopened");
  await evaluate("document.querySelector('.feedback-status-tabs button:nth-child(3)').click();true");
  await until(async () => (await text()).includes("Chưa có phản hồi phù hợp"), "Status filter");
  await evaluate("document.querySelector('.feedback-status-tabs button:first-child').click();true");
  await until(async () => (await text()).includes(maliciousText), "Clear status filter");
  await evaluate("document.querySelector('.feedback-categories button:nth-child(2)').click();true");
  await until(async () => (await text()).includes("Chưa có phản hồi phù hợp"), "Category filter");
  await send("Page.navigate", { url: base + "/admin/feedback/statistics" });
  await until(() => evaluate("document.querySelectorAll('.feedback-metric > strong').length===3 && document.querySelector('.feedback-metric > strong').textContent==='1'"), "Contact statistics");
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.feedback-metric > strong')].map(n=>n.textContent)"), ["1", "1", "0"]);
  assert.deepEqual(legacyRequests, []);
  visual = true;
  for (const route of ["/admin/feedback", "/admin/feedback/statistics"]) {
    await send("Page.navigate", { url: base + route });
    await until(() => evaluate(route.endsWith("statistics") ? "document.querySelector('.feedback-metric > strong')?.textContent==='3'" : "document.querySelectorAll('.feedback-message').length===3"), "Preview data");
    for (const width of [1440, 390]) {
      await send("Emulation.setDeviceMetricsOverride", { width, height: 1050, deviceScaleFactor: 1, mobile: width < 600 });
      await sleep(200);
      assert.ok(await evaluate("document.documentElement.scrollWidth<=innerWidth+1"), "Layout overflow " + width);
      const shot=await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
      await writeFile(resolve(artifacts, `${route.endsWith("statistics") ? "statistics" : "inbox"}-${width}.png`), Buffer.from(shot.data,"base64"));
    }
  }
  await send("Page.navigate", { url: base + "/feedback" });
  await until(() => evaluate("location.pathname==='/contact' && !!document.querySelector('#contact-message')"), "Legacy survey route redirects");
  assert.deepEqual(errors, []);
  evidence.push("PASS: category/status filtering, true contact statistics, no survey requests, survey redirect, escaped text, and desktop/mobile screenshots.");
  console.log(evidence.join("\n"));
} finally {
  socket?.close(); chrome.kill(); vite.kill();
  await writeFile(resolve(artifacts, "summary.txt"), evidence.join("\n") + "\n", "utf8");
}
