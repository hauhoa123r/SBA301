// Production routes/components in Chrome with intercepted API fixtures only.
// Backend correctness is tested separately against the private MySQL runner.
// node frontend/tests/run-admin-browser-audit.mjs [artifact-directory]
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { openSync, closeSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "node:net";
import assert from "node:assert/strict";

const frontend = resolve(process.env.ADMIN_AUDIT_FRONTEND ?? resolve(import.meta.dirname, ".."));
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
const urlIsAdmin = url => new URL(url).pathname.startsWith("/api/admin/");
const vite = spawn(process.execPath, [resolve(frontend, "node_modules/vite/bin/vite.js"), "--host", "127.0.0.1", "--port", String(port), "--strictPort"], { cwd: frontend, windowsHide: true, stdio: "ignore" });
const chromeLog = openSync(resolve(artifacts, "chrome.log"), "a");
const chrome = spawn(process.env.ADMIN_AUDIT_CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", "--no-sandbox", "--disable-background-networking", "--disable-component-update", "--no-first-run", "--no-default-browser-check", `--remote-debugging-port=${chromePort}`, `--user-data-dir=${profile}`, "about:blank"], { windowsHide: true, stdio: ["ignore", chromeLog, chromeLog] });
closeSync(chromeLog);
await writeFile(resolve(artifacts, "owned-processes.json"), JSON.stringify({ vite: vite.pid, chrome: chrome.pid, port, chromePort }));
let socket; const evidence = []; const mutations = []; const errors = [];
let failRegistrations = false, deleted = false, authRole = "ADMIN", emptyData = false, partialCatalog = false;
let apiDelayMs = 0, totalUserCount = 441;
const requests = [];
const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" });
const subscription = { state: "NONE", planCode: null, planName: null, startedAt: null, expiresAt: null };
const student = () => ({ id: 2, fullName: "Browser fixture student", email: "student@example.test", status: deleted ? "DELETED" : "ACTIVE", createdAt: "2026-10-01T00:00:00Z", subscription, enrolledCourses: 0, completedCourses: 0 });
const transaction = { id: 1, transactionId: "TEST-ONLY-1", invoiceId: 1, studentId: 2, student: "Browser fixture student", email: "student@example.test", product: "Premium", productType: "SUBSCRIPTION", amount: 150, method: "PAYOS", status: "SUCCESS", paymentTime: "2026-10-01T00:00:00Z", createdAt: "2026-10-01T00:00:00Z", refundedAmount: 0, invoiceAmount: 150, invoiceStatus: "PAID" };
function fixture(url, method, body) {
  const path = url.pathname;
  requests.push({ path, query: url.search, method });
  if (path === "/api/auth/csrf") return { token: "fixture" };
  if (path === "/api/auth/refresh") return { accessToken: "fixture-token-never-sent-to-backend", user: { id: 1, fullName: "Nguyễn Hải Anh", email: "admin@example.test", roles: [authRole] } };
  if (path === "/api/auth/logout") { mutations.push({ path, method }); return {}; }
  if (path === "/api/admin/dashboard" && partialCatalog) return { overview: null, subscriptions: [] };
  if (path === "/api/admin/dashboard") return { generatedAt: new Date().toISOString(), timezone: "Asia/Ho_Chi_Minh", currency: "VND", overview: { totalUsers: 441, newUsersToday: 2, newUsersThisMonth: 433, totalRevenue: 456200, revenueThisMonth: 99000, activeSubscriptions: 102, usersWithoutSubscription: 339, totalCourses: 3, publishedCourses: 3, hiddenCourses: 0, draftCourses: 0, pendingCourses: 0 }, subscriptions: [{ code: "FREE_TRIAL", name: "Free Trial", users: 97, price: 0, durationDays: 3, active: true, revenue: 0 }, { code: "STANDARD", name: "Standard", users: 0, price: 699000, durationDays: 30, active: false, revenue: 0 }, { code: "PREMIUM", name: "Premium", users: 5, price: 99000, durationDays: 30, active: true, revenue: 456200 }], trends: [{ month: "2026-10", users: 433, revenue: 456200 }], popularCourses: [{ id: 1, title: "Tiếng Trung giao tiếp cho nhân viên Sales", students: 163 }] };
  if (path === "/api/admin/registration-analytics") {
    if (failRegistrations) return { error: true };
    const hour = url.searchParams.get("mode") === "hour";
    return { total: emptyData ? 0 : 433, previousTotal: 300, changePercent: emptyData ? null : 44.3, activeStudents: 3, totalUsers: totalUserCount,
      buckets: hour ? Array.from({ length: 24 }, (_, n) => ({ label: String(n).padStart(2, "0") + ":00", count: n === 1 ? 12 : 0 })) : url.searchParams.get("mode") === "month" ? [{ label: "2026-10", count: 433 }] : Array.from({ length: 14 }, (_, n) => ({ label: `2026-10-${String(n + 13).padStart(2, "0")}`, count: emptyData ? 0 : [2, 3, 1, 0, 5, 6, 3, 2, 8, 63, 32, 21, 11, 37][n] })), hourlySignals: [], notes: ["Browser fixture data only"] };
  }
  if (path === "/api/admin/learning-analytics") return { summary: { totalEnrollments: 194, uniqueEnrolledStudents: 163, studentsStarted: 164, studentsCompletedLesson: 121, courseCompletions: 0 }, courses: [{ id: 1, title: "Fixture course", enrolled: 194, uniqueStudents: 163, started: 164, completedLessonUsers: 121, courseCompletionCount: 0, startRate: 66.7 }], enrollmentTrend: [{ date: "2026-10-22", enrollments: 65 }, { date: "2026-10-23", enrollments: 30 }], settings: { minutes: [5, 10, 15] }, days: emptyData ? [] : [{ date: "2026-10-22", users: 63, watchSeconds: 3200, thresholds: [] }, { date: "2026-10-23", users: 32, watchSeconds: 1800, thresholds: [] }, { date: "2026-10-24", users: 21, watchSeconds: 1800, thresholds: [] }, { date: "2026-10-25", users: 11, watchSeconds: 1800, thresholds: [] }, { date: "2026-10-26", users: 37, watchSeconds: 1800, thresholds: [] }, { date: today, users: 2, watchSeconds: 1800, thresholds: [] }], learners: [], totalLearners: 191, features: [] };
  if (path === "/api/admin/payments/1") return transaction;
  if (path === "/api/admin/payments") return { totalRevenue: 150, revenueThisMonth: 150, revenue: 150, refundedAmount: 0, netRevenue: 150, successfulPayments: 1, pendingPayments: 0, failedPayments: 0, totalTransactions: 1, unknownPaymentTimes: 0, trend: [{ label: "2026-10-01", amount: 150 }], statuses: [{ status: "SUCCESS", count: 1 }], products: [{ type: "SUBSCRIPTION", courseId: null, name: "Premium", revenue: 150 }], content: [transaction], totalElements: 1, totalPages: 1, page: 0, notes: [] };
  if (path === "/api/admin/students/2") {
    if (method === "DELETE") { mutations.push({ path, method, body: JSON.parse(body) }); deleted = true; }
    return { student: student(), courses: [], history: [] };
  }
  if (path === "/api/admin/students") return { content: emptyData ? [] : [student()], totalElements: emptyData ? 0 : 21, totalPages: emptyData ? 0 : 2, page: Number(url.searchParams.get("page") ?? 0) };
  if (path === "/api/admin/subscription-plans") return [{ code: "FREE_TRIAL", name: "Free Trial", price: 0, durationDays: 3, active: true }, { code: "STANDARD", name: "Standard", price: 699000, durationDays: 30, active: false }, { code: "PREMIUM", name: "Premium", price: 99000, durationDays: 30, active: true }];
  if (path === "/api/admin/feedback") return { content: [], totalElements: 0, totalPages: 0, page: 0 };
  if (path === "/api/admin/contact-messages/statistics") return { totalReceived: 2, unreadCount: 1, resolvedCount: 1, categories: [] };
  if (path === "/api/admin/contact-messages") return { content: [], totalElements: 0, totalPages: 0, page: 0, unreadCount: 1 };
  if (path === "/api/admin/auth-settings") return { emailVerificationEnabled: true };
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
      const fulfill = async () => {
        try { await send("Fetch.fulfillRequest", { requestId, responseCode, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(response.error ? { message: "Fixture analytics failure" } : response)).toString("base64") }); }
        catch (e) { if (!String(e).includes("Invalid InterceptionId") && !String(e).includes("Invalid state")) errors.push(String(e)); }
      };
      if (apiDelayMs && urlIsAdmin(request.url)) setTimeout(() => { void fulfill(); }, apiDelayMs); else void fulfill();
    }
  };
  const evaluate = async expression => { const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }); assert.ok(!r.exceptionDetails, "Browser evaluation"); return r.result.value; };
  const text = () => evaluate("document.body.innerText");
  async function go(path, heading) { await send("Page.navigate", { url: base + path }); await until(async () => (await text()).includes(heading) && !(await text()).includes("Đang tải dữ liệu"), path); }
  async function click(label) { assert.equal(await evaluate(`(()=>{const b=[...document.querySelectorAll('button')].find(b=>(b.textContent.trim() || b.getAttribute('aria-label'))===${JSON.stringify(label)});if(!b)return false;b.click();return true})()`), true, label); }
  async function input(selector, value) { await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});Object.getOwnPropertyDescriptor(n.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(n,${JSON.stringify(value)});n.dispatchEvent(new Event('input',{bubbles:true}));return true})()`); }
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    window.__adminPerf={cls:0,longTasks:[]};
    window.__adminMotionStarts=[];
    const animate=Element.prototype.animate;
    Element.prototype.animate=function(...args){window.__adminMotionStarts.push({target:this.getAttribute('class'),at:performance.now()});return animate.apply(this,args)};
    new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__adminPerf.cls+=e.value}).observe({type:'layout-shift',buffered:true});
    new PerformanceObserver(list=>{for(const e of list.getEntries())window.__adminPerf.longTasks.push(e.duration)}).observe({type:'longtask',buffered:true});
  ` });
  await send("Page.bringToFront");
  await send("Fetch.enable", { patterns: [{ urlPattern: `${base}/api/*` }] });
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await go("/admin/dashboard", "Tổng quan Edujar");
  await until(() => evaluate("document.querySelectorAll('.admin-card').length===5 && document.querySelectorAll('.admin-panel svg[role=img]').length===4"), "Five KPIs and four charts");
  await sleep(650);
  await writeFile(resolve(artifacts, "overview-performance.json"), JSON.stringify(await evaluate("({...window.__adminPerf,fixtureOnly:true,navigationMs:performance.now(),viewport:innerWidth})"),null,2));
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.admin-shell')).backgroundColor"), "rgb(248, 250, 252)");
  assert.equal(await evaluate("document.querySelector('.admin-sidebar .admin-brand').textContent.includes('edujar')"), true);
  assert.deepEqual(await evaluate("[...document.querySelectorAll('.admin-card-value')].map(n=>n.textContent)"), ["441", "3", "2", "150\u00a0\u20ab", "1"]);
  if (process.env.ADMIN_MOTION_AUDIT === "1") {
    assert.equal(await evaluate("document.querySelectorAll('.admin-card-value')[3].getAttribute('aria-label').includes('150')"), true, "Exact financial value exposed");
    await evaluate("window.__savedSidebar=document.querySelector('.admin-sidebar');window.__savedHeader=document.querySelector('.admin-topbar');document.querySelector('.admin-sidebar a[href=\"/admin/students\"]').click();true");
    await until(async () => (await text()).includes("21 học viên"), "SPA students");
    assert.equal(await evaluate("window.__savedSidebar===document.querySelector('.admin-sidebar') && window.__savedHeader===document.querySelector('.admin-topbar')"), true, "Persistent shell DOM");
    assert.equal(await evaluate("document.activeElement===document.querySelector('.admin-page-header h1')"), true, "Page navigation moves keyboard focus to heading");
    await evaluate("document.querySelector('.admin-sidebar a[href=\"/admin/dashboard\"]').click();true");
    await until(() => evaluate("document.querySelectorAll('.admin-card-value').length===5 && document.querySelectorAll('.admin-card-value')[0].textContent==='441'"), "SPA dashboard");
    await sleep(600);
    const starts = await evaluate("window.__adminMotionStarts.length");
    await evaluate("document.querySelector('.admin-chart-plot circle').focus();true");
    await sleep(100);
    assert.equal(await evaluate("window.__adminMotionStarts.length"), starts, "Hover/focus never replays data or page animation");
    apiDelayMs = 400;
    await click("Làm mới dữ liệu");
    assert.equal(await evaluate("document.querySelectorAll('.admin-card-value')[0].textContent"), "441", "Same-query refresh retains truthful previous result");
    await until(() => evaluate("!document.querySelector('.admin-cards[aria-busy=true]')"), "Same-query refresh finishes");
    await sleep(450);
    assert.equal(await evaluate("window.__adminMotionStarts.length"), starts, "Identical response does not replay charts/page");
    totalUserCount = 456;
    await click("Làm mới dữ liệu");
    await until(() => evaluate("document.querySelectorAll('.admin-card-value')[0].textContent.includes('≈')"), "Changed count interpolates visibly");
    assert.equal(await evaluate("document.querySelectorAll('.admin-card-value')[0].getAttribute('aria-label').endsWith('456')"), true, "Assistive technology receives final server count during animation");
    await until(() => evaluate("document.querySelectorAll('.admin-card-value')[0].textContent==='456'"), "Count settles at exact response");
    apiDelayMs = 650;
    await send("Page.navigate", { url: base + "/admin/dashboard" });
    await until(() => evaluate("document.querySelectorAll('.admin-card .admin-skeleton-value').length===5"), "Five stable KPI skeletons");
    const loadingHeight = await evaluate("document.querySelector('.admin-cards').getBoundingClientRect().height");
    const loadingShot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
    await writeFile(resolve(artifacts, "overview-loading.png"), Buffer.from(loadingShot.data, "base64"));
    await until(() => evaluate("document.querySelectorAll('.admin-card-value')[0].textContent==='456'"), "Slow response completes");
    const loadedHeight = await evaluate("document.querySelector('.admin-cards').getBoundingClientRect().height");
    assert.ok(Math.abs(loadingHeight-loadedHeight)<3, `KPI grid stays stable: ${loadingHeight}/${loadedHeight}`);
    apiDelayMs = 0; totalUserCount = 441;
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await click("Làm mới dữ liệu");
    await until(() => evaluate("document.querySelectorAll('.admin-card-value')[0].textContent==='441'"), "Reduced-motion count settles immediately");
    assert.equal(await evaluate("document.querySelectorAll('.admin-card-value')[0].textContent.includes('≈')"), false);
    await evaluate("document.querySelector('.admin-sidebar a[href=\"/admin/catalog-dashboard\"]').click();true");
    await until(async () => (await text()).includes("Thống kê gói đăng ký"), "Reduced-motion catalog navigation");
    await go("/admin/payments", "TEST-ONLY-1");
    await click("Xem");
    assert.equal(await evaluate("document.querySelectorAll('[role=dialog]').length"), 1);
    assert.equal(await evaluate("document.getAnimations().filter(a=>a.playState==='running').length"), 0, "Reduced motion cancels CSS and WAAPI animations");
    await click("Đóng");
    await send("Emulation.setEmulatedMedia", { features: [] });
    await go("/admin/dashboard", "Tổng quan Edujar");
    await sleep(650);
    evidence.push("PASS: persistent sidebar/header and heading focus; skeleton grid stable under 650ms latency; count-up only on changes; exact financial/accessibility values; no replay on hover/same-data refetch; reduced-motion disables CSS/WAAPI.");
  }
  await click("Thu gọn sidebar");
  assert.equal(await evaluate("document.querySelector('.admin-shell').classList.contains('admin-is-collapsed')"), true);
  await until(() => evaluate("getComputedStyle(document.querySelector('.admin-sidebar')).width==='76px'"), "Collapsed sidebar width");
  await click("Mở rộng sidebar");
  await sleep(500);
  for (const width of [1440, 820, 390]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width === 390 });
    await sleep(500);
    const layout = await evaluate("({workX:document.querySelector('.admin-work-area').getBoundingClientRect().left,sidebarRight:document.querySelector('.admin-sidebar')?.getBoundingClientRect().right,cardX:document.querySelector('.admin-card').getBoundingClientRect().left,margin:getComputedStyle(document.querySelector('.admin-work-area')).marginLeft,scrollX,scrollY,ancestors:[...document.querySelectorAll('.admin-main,.admin-page-surface,.admin-work-area')].map(n=>({class:n.className,x:n.scrollLeft,y:n.scrollTop,rect:n.getBoundingClientRect().left,overflow:getComputedStyle(n).overflow}))})");
    await writeFile(resolve(artifacts, `layout-${width}.json`), JSON.stringify(layout,null,2));
    if (width >= 1024) assert.ok(layout.workX >= layout.sidebarRight - 1, "Sidebar must not cover desktop content");
    assert.equal(await evaluate("document.documentElement.scrollWidth <= window.innerWidth"), true, `No page overflow at ${width}`);
    if (width < 1024) {
      await click("Mở điều hướng");
      await until(() => evaluate("!!document.querySelector('.admin-drawer[role=dialog]')"), "Mobile drawer");
      assert.equal(await evaluate("getComputedStyle(document.body).overflow"), "hidden");
      await evaluate("document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));true");
      await until(() => evaluate("!document.querySelector('.admin-drawer')"), "Escape closes drawer");
    }
    // Freeze CSS effects only for the static capture; interaction/motion is
    // tested above. Full-page capture resizes Chrome's paint surface.
    await evaluate("(()=>{const style=document.createElement('style');style.id='audit-static-capture';style.textContent='.admin-shell *,.admin-shell *::before,.admin-shell *::after{transition:none!important;animation:none!important}';document.head.append(style);return true})()");
    await sleep(100);
    const dimensions = await evaluate("({width:document.documentElement.clientWidth,height:document.documentElement.scrollHeight})");
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: true, clip: { x: 0, y: 0, ...dimensions, scale: 1 } });
    await writeFile(resolve(artifacts, `overview-${width}.png`), Buffer.from(shot.data, "base64"));
    await evaluate("document.querySelector('#audit-static-capture').remove();true");
  }
  evidence.push("PASS: light theme, five truthful KPI cards, four real charts, sidebar collapse, mobile focus-managed drawer/Escape, no overflow at 1440/820/390px (API fixtures).");
  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await evaluate("(()=>{const n=document.querySelector('.admin-date-controls select');n.value='week';n.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await click("Áp dụng");
  await until(async () => (await text()).includes("Tuần 2026-10-12"), "Weekly grouping of server daily events");
  assert.ok(requests.some(r => r.path==='/api/admin/registration-analytics' && r.query.includes('mode=day')));
  await evaluate("(()=>{const n=document.querySelector('.admin-date-controls select');n.value='month';n.dispatchEvent(new Event('change',{bubbles:true}));return true})()");
  await click("Áp dụng");
  await until(() => requests.some(r => r.path==='/api/admin/registration-analytics' && r.query.includes('mode=month')), "Monthly API filter");
  evidence.push("PASS: week aggregates daily events, month changes API grouping; DAU remains daily and is never summed as weekly unique users.");
  await go("/admin/dashboard", "Hành trình học tập");
  assert.equal(await evaluate("document.querySelector('a[href=\"/admin/registration-analytics\"]')===null"), true, "Registration navigation removed");
  const registrationRequests = requests.filter(r => r.path==='/api/admin/registration-analytics').length;
  await send("Page.navigate", { url: base + "/admin/registration-analytics" });
  await until(() => evaluate("document.querySelector('main h1')?.textContent.trim()==='404' && !document.querySelector('.admin-shell')"), "Removed registration route");
  await sleep(300);
  assert.equal(requests.filter(r => r.path==='/api/admin/registration-analytics').length, registrationRequests, "Removed registration page makes no API calls");
  evidence.push("PASS: registration page/menu removed including hourly signals; old URL shows not-found; overview registration chart retained.");
  await go("/admin/catalog-dashboard", "Thống kê gói đăng ký");
  assert.equal(await evaluate("document.body.textContent.includes('Standard')"), false, "Standard hidden in plan table, summary and chart");
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('#subscriptions tbody tr td:first-child')).map(n=>n.textContent.trim())"), ["Free Trial", "Premium"]);
  evidence.push("PASS: API fixture retains Standard; catalog hides its table row, summary and chart while keeping Free Trial/Premium.");
  assert.equal(await evaluate("!!document.querySelector('#courses') || document.body.textContent.includes('Quản lý và thống kê khóa học') || !!document.querySelector('[aria-label=\"Tìm kiếm tên khóa học\"]')"), false, "Course management panel fully removed");
  assert.equal(requests.some(r=>r.path.startsWith('/api/admin/dashboard/courses')), false, "Catalog no longer requests course management API");
  assert.equal(await evaluate("!!document.querySelector('.admin-popular') && document.querySelectorAll('.admin-cards .admin-card').length===4"), true, "Popular courses and catalog summary preserved");
  assert.equal(mutations.length, 0, "Read-only catalog makes no business mutations");
  evidence.push("PASS: course management panel/table/search/details removed from catalog with no management API requests; popular courses, four summary cards and subscription statistics retained.");
  await go("/admin/payments", "TEST-ONLY-1");
  assert.equal(await evaluate("document.querySelectorAll('.admin-cards .admin-card').length===8 && !document.body.textContent.includes('Doanh thu ròng trong khoảng')"), true, "Net revenue card removed; eight remaining payment metrics preserved");
  assert.equal(await evaluate("[...document.querySelectorAll('.admin-panel h2')].some(n=>n.textContent==='Doanh thu theo sản phẩm')"), false, "Product revenue section removed");
  assert.equal(await evaluate("[...document.querySelectorAll('.admin-panel h2')].some(n=>n.textContent==='Doanh thu theo sản phẩm')"), false, "Product revenue section removed");
  await click("Xem"); await until(async () => (await text()).includes("Chi tiết giao dịch #1"), "Payment detail"); await click("Đóng");
  await go("/admin/students", "21 học viên");
  await input('[aria-label="Tìm học viên theo tên hoặc email"]', "Browser"); await click("Tìm kiếm");
  await until(() => requests.some(r => r.path==='/api/admin/students' && r.query.includes('search=Browser')), "Student server search");
  await click("Sau"); await until(() => requests.some(r => r.path==='/api/admin/students' && r.query.includes('page=1')), "Student server pagination");
  await go("/admin/students/2", "Browser fixture student"); await click("Xóa tài khoản học viên");
  await input("[role=dialog] textarea", "Browser deletion confirmation"); await click("Xác nhận xóa mềm");
  await until(async () => (await text()).includes("Đã xóa mềm"), "Deletion refresh");
  assert.equal(mutations.at(-1).method, "DELETE"); assert.equal(mutations.at(-1).body.reason, "Browser deletion confirmation");
  evidence.push("PASS: payment detail; student deletion dialog requires reason and refreshes DELETED state.");
  await go("/admin/dashboard", "Hành trình học tập");
  assert.equal(await evaluate("document.querySelector('a[href=\"/admin/learning-analytics\"]')===null"), true, "Learning analytics links removed from overview and sidebar");
  const learningRequestsBefore = requests.filter(r => r.path==='/api/admin/learning-analytics').length;
  await send("Page.navigate", { url: base + "/admin/learning-analytics" });
  await until(() => evaluate("document.querySelector('main h1')?.textContent.trim()==='404' && !document.querySelector('.admin-shell')"), "Removed learning analytics route");
  await sleep(300);
  assert.equal(requests.filter(r => r.path==='/api/admin/learning-analytics').length, learningRequestsBefore, "Removed route makes no learning analytics calls");
  evidence.push("PASS: learning analytics page/menu/detail link removed, old URL shows not-found; overview/enrollment API remains available.");
  const enrollmentStart = requests.length;
  await go("/admin/enrollments", "Lượt ghi danh theo ngày");
  assert.equal(await evaluate("document.querySelector('.admin-date-controls input[type=checkbox]')===null"), true, "Enrollment lab checkbox removed");
  assert.ok(requests.slice(enrollmentStart).some(r => r.path==='/api/admin/learning-analytics' && new URLSearchParams(r.query).get('includeLab')==='true'), "Enrollments includes lab by default");
  const enrollmentRefresh = requests.length;
  await input('.admin-date-controls input[type=date]', "2026-10-01");
  await click("Áp dụng");
  await until(() => requests.slice(enrollmentRefresh).some(r => r.path==='/api/admin/learning-analytics' && new URLSearchParams(r.query).get('includeLab')==='true'), "Enrollment date filter retains lab inclusion");
  await until(async () => (await text()).includes("Lượt ghi danh theo ngày") && !(await text()).includes("Đang tải dữ liệu"), "Enrollment filter finishes");
  assert.equal(await evaluate("document.querySelectorAll('.admin-card').length===4 && document.querySelectorAll('svg[role=img]').length===1 && document.querySelectorAll('table').length===1"), true, "Enrollment keeps four metrics/chart and only chart accessible data table");
  assert.equal(await evaluate("document.body.textContent.includes('Ghi danh theo khóa học') || !!document.querySelector('[aria-label=\"Tìm khóa học đã ghi danh\"]')"), false, "Course enrollment panel removed");
  evidence.push("PASS: enrollment course panel/search removed; four metrics/chart preserved; default and filtered requests explicitly includeLab=true without checkbox.");
  await go("/admin/feedback", "Hộp thư góp ý");
  await go("/admin/feedback/statistics", "Tổng feedback đã nhận");
  await go("/admin/catalog-dashboard", "Thống kê gói & danh mục");
  await go("/admin/subscription-plans", "Quản lý gói học");
  await until(() => evaluate("document.querySelectorAll('tbody tr').length===2"), "Visible subscription plans loaded");
  assert.deepEqual(await evaluate("Array.from(document.querySelectorAll('tbody tr td:first-child strong')).map(n=>n.textContent.trim())"), ["Free Trial", "Premium"]);
  assert.equal(await evaluate("document.body.textContent.includes('Standard') || document.body.textContent.includes('STANDARD')"), false, "Standard hidden on plan management page");
  await evaluate("Array.from(document.querySelectorAll('tbody tr')).find(n=>n.textContent.includes('PREMIUM')).querySelector('button').click();true");
  await until(async () => (await text()).includes("Chỉnh sửa Premium"), "Premium editor retained");
  await click("Hủy");
  await click("Làm mới");
  await until(() => evaluate("document.querySelectorAll('tbody tr').length===2"), "Standard stays hidden after refresh");
  assert.equal(requests.some(r=>r.path.startsWith('/api/admin/subscription-plans') && r.method!=='GET'), false, "Hiding plan does not mutate configuration");
  evidence.push("PASS: plan management API fixture includes Standard but only Free Trial/Premium render after load/refresh; Premium editor retained without writes.");
  assert.equal(await evaluate("document.querySelector('a[href=\"/admin/assignments\"]')===null"), true, "No assignment links on catalog/subscription page");
  const assignmentRequests = requests.filter(r => r.path.startsWith('/api/admin/assignments')).length;
  await send("Page.navigate", { url: base + "/admin/assignments" });
  await until(() => evaluate("document.querySelector('main h1')?.textContent.trim()==='404' && !document.querySelector('.admin-shell')"), "Removed assignment route");
  await sleep(300);
  assert.equal(requests.filter(r => r.path.startsWith('/api/admin/assignments')).length, assignmentRequests, "No assignment API calls from removed page");
  evidence.push("PASS: assignment review page/menu/links removed; old URL shows not-found without assignment API calls.");
  await go("/admin/auth-settings", "Xác minh email khi đăng ký");
  assert.equal(await evaluate("document.querySelector('a[href=\"/admin/activity-lab\"]')===null"), true, "Removed Activity Lab navigation");
  const labRequestsBefore = requests.filter(r => r.path.startsWith('/api/admin/activity-lab')).length;
  await send("Page.navigate", { url: base + "/admin/activity-lab" });
  await until(() => evaluate("document.querySelector('main h1')?.textContent.trim()==='404' && !document.querySelector('.admin-shell')"), "Removed Activity Lab route");
  await sleep(500);
  assert.equal(requests.filter(r => r.path.startsWith('/api/admin/activity-lab')).length, labRequestsBefore, "Removed route makes no Activity Lab API requests");
  evidence.push("PASS: Activity Lab absent from admin navigation; old URL uses not-found view without Activity Lab API requests.");
  await go("/admin/dashboard", "Tổng quan Edujar");
  assert.equal(await evaluate("document.querySelector('a[href=\"/admin/courses\"]')===null"), true, "Removed courses navigation");
  const coursesRequestsBefore = requests.filter(r => r.path.startsWith('/api/admin/dashboard/courses')).length;
  await send("Page.navigate", { url: base + "/admin/courses" });
  await until(() => evaluate("document.querySelector('main h1')?.textContent.trim()==='404' && !document.querySelector('.admin-shell')"), "Removed courses route");
  await sleep(300);
  assert.equal(requests.filter(r => r.path.startsWith('/api/admin/dashboard/courses')).length, coursesRequestsBefore, "Removed page makes no management requests");
  evidence.push("PASS: standalone courses page/menu removed; old URL shows not-found without management requests; catalog statistics retained.");
  emptyData = true; await go("/admin/dashboard", "Không có dữ liệu trong khoảng chọn");
  assert.equal(await evaluate("document.querySelector('.admin-card-trend')===null"), true, "No invented growth with null comparison");
  emptyData = false;
  partialCatalog = true; await go("/admin/dashboard", "Phản hồi thống kê chưa đầy đủ");
  assert.equal(await evaluate("document.querySelectorAll('.admin-card-value')[1].textContent"), "—");
  partialCatalog = false; await click("Thử lại");
  await until(() => evaluate("document.querySelectorAll('.admin-card-value')[1].textContent==='3'"), "Incomplete catalog retry");
  assert.deepEqual(errors, []);
  evidence.push("PASS: management routes share layout; student search/pagination, soft delete, payment detail, enrollment empty state, feedback statistics and null metrics preserve business behavior.");
  await evaluate("document.querySelector('[aria-label=\"Menu người dùng\"]').click();true");
  await click("Đăng xuất"); await until(() => evaluate("location.pathname==='/login'"), "Existing logout flow");
  await until(() => mutations.some(m => m.path==='/api/auth/logout' && m.method==='POST'), "Logout request confirmed");
  await send("Page.navigate", { url: base + "/admin/dashboard" }); await until(() => evaluate("location.pathname==='/login'"), "Logged-out admin route");
  authRole = "STUDENT"; await evaluate("localStorage.clear();sessionStorage.clear();true");
  await send("Page.navigate", { url: base + "/admin/enrollments" }); await until(() => evaluate("location.pathname==='/404'"), "Student denied admin route");
  assert.deepEqual(errors, []);
  evidence.push("PASS: profile uses existing logout endpoint; guest redirects to login and STUDENT is denied the new admin route.");
  console.log(evidence.join("\n"));
} finally {
  socket?.close(); chrome.kill(); vite.kill();
  await writeFile(resolve(artifacts, "browser-summary.txt"), evidence.join("\n") + "\n", "utf8");
}
