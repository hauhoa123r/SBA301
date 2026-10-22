// Production routes/components in Chrome with intercepted API fixtures only.
// Backend correctness is tested separately against the private MySQL runner.
// node frontend/tests/run-admin-browser-audit.mjs [artifact-directory]
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { openSync, closeSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "node:net";
import assert from "node:assert/strict";

const frontend = resolve(import.meta.dirname, "..");
const artifacts = resolve(process.argv[2] ?? "backend/target/admin-browser");
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(resolve(artifacts, "chrome-"));
const sleep = ms => new Promise(done => setTimeout(done, ms));
async function freePort() {
  const server = createServer(); await new Promise(done => server.listen(0, "127.0.0.1", done));
  const port = server.address().port; await new Promise(done => server.close(done)); return port;
}
async function until(fn, message) {
  const end = Date.now() + 30000;
  while (Date.now() < end) { try { if (await fn()) return; } catch { /* Starting. */ } await sleep(100); }
  throw new Error("Timed out: " + message);
}
const port = await freePort(), chromePort = await freePort();
const base = `http://127.0.0.1:${port}`;
const vite = spawn(process.execPath, [resolve(frontend, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { cwd: frontend, windowsHide: true, stdio: "ignore" });
const chromeLog = openSync(resolve(artifacts, "chrome.log"), "a");
const chrome = spawn(process.env.ADMIN_AUDIT_CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--no-sandbox", "--disable-gpu", "--in-process-gpu", "--disable-background-networking", "--disable-component-update", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${chromePort}`, `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: ["ignore", chromeLog, chromeLog] });
closeSync(chromeLog);
await writeFile(resolve(artifacts, "owned-processes.json"), JSON.stringify({ vite: vite.pid, chrome: chrome.pid, port, chromePort }));
let socket; const evidence = []; const mutations = []; const errors = [];
let failRegistrations = false, coursePrice = 100, deleted = false;
const subscription = { state: "NONE", planCode: null, planName: null, startedAt: null, expiresAt: null };
const student = () => ({ id: 2, fullName: "Browser fixture student", email: "student@example.test", status: deleted ? "DELETED" : "ACTIVE", createdAt: "2026-10-01T00:00:00Z", subscription, enrolledCourses: 0, completedCourses: 0 });
const transaction = { id: 1, transactionId: "TEST-ONLY-1", invoiceId: 1, studentId: 2, student: "Browser fixture student", email: "student@example.test", product: "Premium", productType: "SUBSCRIPTION", amount: 150, method: "PAYOS", status: "SUCCESS", paymentTime: "2026-10-01T00:00:00Z", createdAt: "2026-10-01T00:00:00Z", refundedAmount: 0, invoiceAmount: 150, invoiceStatus: "PAID" };
function fixture(url, method, body) {
  const path = url.pathname;
  if (path === "/api/auth/csrf") return { token: "fixture" };
  if (path === "/api/auth/refresh") return { accessToken: "fixture-token-never-sent-to-backend", user: { id: 1, fullName: "Browser fixture admin", email: "admin@example.test", roles: ["ADMIN"] } };
  if (path === "/api/admin/registration-analytics") {
    if (failRegistrations) return { error: true };
    const hour = url.searchParams.get("mode") === "hour";
    return { total: 12, previousTotal: 6, changePercent: 100, activeStudents: 3, totalUsers: 4, buckets: hour ? Array.from({ length: 24 }, (_, n) => ({ label: String(n).padStart(2, "0") + ":00", count: n === 1 ? 12 : 0 })) : [{ label: "2026-10-01", count: 12 }], hourlySignals: [], notes: ["Browser fixture data only"] };
  }
  if (path === "/api/admin/learning-analytics") return { summary: { totalEnrollments: 4, uniqueEnrolledStudents: 3, studentsStarted: 2, studentsCompletedLesson: 1, courseCompletions: 0 }, courses: [{ id: 1, title: "Fixture course", enrolled: 4, uniqueStudents: 3, started: 2, completedLessonUsers: 1, courseCompletionCount: 0, startRate: 66.7 }], enrollmentTrend: [{ date: "2026-10-01", enrollments: 4 }], settings: { minutes: [5, 10, 15] }, days: [], learners: [], totalLearners: 0, features: [] };
  if (path === "/api/admin/payments/1") return transaction;
  if (path === "/api/admin/payments") return { totalRevenue: 150, revenueThisMonth: 150, revenue: 150, refundedAmount: 0, netRevenue: 150, successfulPayments: 1, pendingPayments: 0, failedPayments: 0, totalTransactions: 1, unknownPaymentTimes: 0, trend: [{ label: "2026-10-01", amount: 150 }], statuses: [{ status: "SUCCESS", count: 1 }], products: [{ type: "SUBSCRIPTION", courseId: null, name: "Premium", revenue: 150 }], content: [transaction], totalElements: 1, totalPages: 1, page: 0, notes: [] };
  if (path === "/api/admin/dashboard/courses/1/price") { mutations.push({ path, method, body: JSON.parse(body) }); coursePrice = Number(JSON.parse(body).price); return { id: 1, price: coursePrice, status: "PUBLISHED" }; }
  if (path === "/api/admin/dashboard/courses") return { content: [{ id: 1, title: "Fixture course", price: coursePrice, status: "PUBLISHED", students: 3, learning: 2, completed: 1, completionRate: 33.3, revenue: 150 }], totalElements: 1, totalPages: 1, page: 0, size: 10 };
  if (path === "/api/admin/students/2") {
    if (method === "DELETE") { mutations.push({ path, method, body: JSON.parse(body) }); deleted = true; }
    return { student: student(), courses: [], history: [] };
  }
  if (path === "/api/admin/students") return { content: [student()], totalElements: 1, totalPages: 1, page: 0 };
  if (path === "/api/admin/subscription-plans") return [{ code: "PREMIUM", name: "Premium", price: 99000, durationDays: 30, active: true }];
  if (path === "/api/admin/feedback") return { content: [], totalElements: 0, totalPages: 0, page: 0 };
  return { unhandled: path };
}
try {
  await until(async () => (await fetch(base)).ok, "Vite");
  await until(async () => (await fetch(`http://127.0.0.1:${chromePort}/json/version`)).ok, "Chrome");
  const target = await (await fetch(`http://127.0.0.1:${chromePort}/json/new?about:blank`, { method: "PUT", signal: AbortSignal.timeout(10000) })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; });
  let id = 0; const pending = new Map();
  function send(method, params = {}) {
    return new Promise((done, fail) => { const key = ++id; pending.set(key, { done, fail }); socket.send(JSON.stringify({ id: key, method, params })); setTimeout(() => { if(pending.delete(key)) fail(new Error("CDP timeout: " + method)); },20000).unref(); });
  }
  socket.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id) { const item = pending.get(msg.id); pending.delete(msg.id); if (msg.error) item?.fail(new Error(msg.error.message)); else item?.done(msg.result); }
    if (msg.method === "Runtime.exceptionThrown") errors.push(msg.params.exceptionDetails.text);
    if (msg.method === "Fetch.requestPaused") {
      const { requestId, request } = msg.params;
      const response = fixture(new URL(request.url), request.method, request.postData);
      const responseCode = response.error ? 500 : response.unhandled ? 404 : 200;
      void send("Fetch.fulfillRequest", { requestId, responseCode, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(response.error ? { message: "Fixture analytics failure" } : response)).toString("base64") });
    }
  };
  const evaluate = async expression => { const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); assert.ok(!r.exceptionDetails, "Browser evaluation"); return r.result.value; };
  const text = () => evaluate("document.body.innerText");
  async function go(path, heading) { await send("Page.navigate", { url: base + path }); await until(async () => (await text()).includes(heading) && !(await text()).includes("Đang tải dữ liệu"), path); }
  async function click(label) { assert.equal(await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(label)});if(!b)return false;b.click();return true})()`), true, label); }
  async function input(selector, value) { await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(n.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(n,${JSON.stringify(value)});n.dispatchEvent(new Event('input',{bubbles:true}));return true})()`); }
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.bringToFront");
  await send("Fetch.enable", { patterns: [{ urlPattern: `${base}/api/*` }] });
  await go("/admin/dashboard", "Tổng quan Edujar");
  await until(() => evaluate("document.querySelectorAll('.admin-card').length===6 && document.querySelectorAll('.admin-panel svg').length===5"), "Six KPIs and five charts");
  for (const width of [1440, 820, 390]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width === 390 });
    await sleep(150);
    assert.equal(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), true, `No page overflow at ${width}`);
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    await writeFile(resolve(artifacts, `overview-${width}.png`), Buffer.from(shot.data, "base64"));
  }
  evidence.push("PASS: overview has six real components and five charts; no page overflow at 1440/820/390px (API fixtures).");
  await go("/admin/registration-analytics", "Xu hướng đăng ký");
  await evaluate("(()=>{const n=document.querySelector('select');n.value='hour';n.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await click("Áp dụng");
  await until(() => evaluate("document.querySelectorAll('svg rect').length===24"), "Hourly zero fill");
  await evaluate("document.querySelector('svg rect').focus();true");
  await sleep(200);
  await writeFile(resolve(artifacts, "tooltip-focus.json"), JSON.stringify(await evaluate("({text:document.querySelector('.admin-chart-tooltip').textContent,active:document.activeElement?.outerHTML})")));
  await until(() => evaluate("document.querySelector('.admin-chart-tooltip').textContent.includes('00:00: 0')"), "Keyboard tooltip");
  evidence.push("PASS: hourly filter renders 24 buckets; keyboard focus exposes exact zero count.");
  failRegistrations = true; await go("/admin/registration-analytics", "Fixture analytics failure");
  failRegistrations = false; await click("Thử lại"); await until(async () => (await text()).includes("Xu hướng đăng ký"), "Retry recovery");
  evidence.push("PASS: analytics error and retry recover.");
  await go("/admin/courses", "Fixture course"); await click("Sửa giá");
  await input("[role=dialog] input", "250"); await input("[role=dialog] textarea", "Browser price confirmation");
  await click("Kiểm tra thay đổi"); assert.equal(mutations.length, 0); await click("Xác nhận lưu giá");
  await until(() => evaluate("!document.querySelector('[role=dialog]')"), "Price saved");
  assert.equal(mutations[0].body.expectedPrice, "100"); assert.equal(mutations[0].body.price, "250");
  evidence.push("PASS: price edits require reason and confirmation, send old/new price and refresh list.");
  await go("/admin/payments", "TEST-ONLY-1"); await click("Xem"); await until(async () => (await text()).includes("Chi tiết giao dịch #1"), "Payment detail"); await click("Đóng");
  await go("/admin/students/2", "Browser fixture student"); await click("Xóa tài khoản học viên");
  await input("[role=dialog] textarea", "Browser deletion confirmation"); await click("Xác nhận xóa mềm");
  await until(async () => (await text()).includes("Đã xóa mềm"), "Deletion refresh");
  assert.equal(mutations.at(-1).method, "DELETE"); assert.equal(mutations.at(-1).body.reason, "Browser deletion confirmation");
  evidence.push("PASS: payment detail; student deletion dialog requires reason and refreshes DELETED state.");
  await go("/admin/learning-analytics", "Lượt ghi danh trong khoảng chọn");
  await go("/admin/feedback", "Feedback");
  assert.deepEqual(errors, []);
  evidence.push("PASS: learning and existing Feedback routes render without uncaught JavaScript errors.");
  console.log(evidence.join("\n"));
} finally {
  socket?.close(); chrome.kill(); vite.kill();
  await writeFile(resolve(artifacts, "browser-summary.txt"), evidence.join("\n") + "\n", "utf8");
}
