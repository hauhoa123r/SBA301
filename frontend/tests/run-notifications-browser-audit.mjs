// Local Notification Center regression. API fixtures only; no production traffic or writes.
// node frontend/tests/run-notifications-browser-audit.mjs [artifact-directory]
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';

const frontend = resolve(import.meta.dirname, '..');
const artifacts = resolve(process.argv[2] ?? 'backend/target/notification-center-audit');
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(resolve(artifacts, 'chrome-'));
const sleep = ms => new Promise(done => setTimeout(done, ms));
async function freePort() {
  const server = createServer(); await new Promise(done => server.listen(0, '127.0.0.1', done));
  const port = server.address().port; await new Promise(done => server.close(done)); return port;
}
async function until(fn, label) {
  const end = Date.now() + 30000;
  while (Date.now() < end) { if (await fn()) return; await sleep(100); }
  throw new Error('Timed out: ' + label);
}
const port = await freePort(), chromePort = await freePort(), base = `http://127.0.0.1:${port}`;
const vite = spawn(process.execPath, [resolve(frontend, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', String(port), '--strictPort'], { cwd: frontend, windowsHide: true, stdio: 'ignore' });
const chrome = spawn(process.env.WORKSPACE_AUDIT_CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--no-sandbox', '--disable-background-networking', '--disable-component-update', '--no-first-run', '--no-default-browser-check', `--remote-debugging-port=${chromePort}`, `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: 'ignore' });
let socket, delay = 0, getFailure = false, writeFailure = false, studentId = 7;
const requests = [], errors = [], evidence = [], activeRequests = new Map();
let peakConcurrentPageRequests = 0;
const stamp = hours => new Date(Date.now() - hours * 3600000).toISOString();
const makeRows = () => Array.from({ length: 24 }, (_, index) => ({
  id: index + 1, type: index === 0 ? 'FEEDBACK_REPLY' : index === 4 ? 'SYSTEM' : 'STUDY_REMINDER',
  title: index === 0 ? 'Edujar đã trả lời góp ý #12' : index === 4 ? 'Cập nhật học tập' : 'Bài học dành cho bạn hôm nay',
  content: index === 0 ? 'Chủ đề: Hỗ trợ khóa học\n\nCảm ơn bạn đã góp ý. Chúng tôi đã bổ sung tài liệu hội thoại để bạn dễ ôn tập. Bạn có thể tiếp tục bài học và trao đổi với giảng viên khi cần. <script>window.notificationXss=true</script>' : index === 4 ? 'Cập nhật học tập' : 'Tiếp tục “Gặp trưởng nhóm” trong khóa “Tiếng Trung giao tiếp cho Nhân viên Sales”. Dành vài phút để giữ nhịp học nhé!',
  read: index > 10, createdAt: stamp(index === 0 ? .03 : (index - 1) * 24 + 1),
  path: index === 0 ? '/learning#notifications' : index === 4 ? 'https://evil.invalid/' : '/learning/courses/1/lessons/2',
}));
let rows = makeRows();
function fixture(url, method) {
  const path = url.pathname; requests.push({ path, method, page: url.searchParams.get('page') });
  if (path === '/api/auth/csrf') return { token: 'fixture-only' };
  if (path === '/api/auth/refresh') return { accessToken: 'fixture-not-a-real-token', user: { id: studentId, fullName: 'Minh Anh', email: 'learner@example.test', roles: ['STUDENT'] } };
  if (path === '/api/notifications/daily-study') return { created: false, recommendation: null };
  if (path === '/api/notifications/recommendation') return { created: false, recommendation: null };
  if (path === '/api/learning/stats') return { studentName: 'Minh Anh', enrolledCourses: [] };
  if (path === '/api/learning/streak') return { current: 0, longest: 0, activeToday: false, timezone: 'Asia/Ho_Chi_Minh' };
  if (path === '/api/learning/activity') return [];
  if (path === '/api/learning/courses/1') return { id: 1, title: 'Tiếng Trung giao tiếp cho Nhân viên Sales', chapters: [{ id: 10, orderIndex: 1, title: 'Làm quen với môi trường làm việc', quizzes: [], assignments: [], lessons: [{ id: 2, orderIndex: 1, title: 'Gặp trưởng nhóm', durationSeconds: 840, content: '您好！我是新来的员工。\nXin chào! Tôi là nhân viên mới.', documents: [], vocabularies: [], sentencePatterns: [] }] }] };
  if (path === '/api/learning/courses/1/progress') return { courseId: 1, progressPercent: 0, completedActivities: 0, completedLessonIds: [], completedChapterIds: [], passedQuizIds: [], submittedAssignmentIds: [] };
  if (path === '/api/notifications') {
    if (getFailure) return { httpStatus: 500, message: 'Chưa thể tải thông báo kiểm thử.' };
    const page = Number(url.searchParams.get('page') ?? 0);
    return { content: rows.slice(page * 20, (page + 1) * 20).map(row => ({ ...row })), unreadCount: rows.filter(row => !row.read).length, totalPages: Math.ceil(rows.length / 20), page };
  }
  if (method === 'PUT' && path.startsWith('/api/notifications/')) {
    if (writeFailure) return { httpStatus: 500, message: 'Chưa thể lưu trạng thái kiểm thử.' };
    if (path === '/api/notifications/read') rows.forEach(row => { row.read = true; });
    else { const row = rows.find(row => row.id === Number(path.split('/')[3])); if (row) row.read = true; }
    return { httpStatus: 204 };
  }
  return { httpStatus: 404, message: 'Unhandled fixture: ' + path };
}
try {
  await until(async () => { try { return (await fetch(base)).ok; } catch { return false; } }, 'Vite');
  await until(async () => { try { return (await fetch(`http://127.0.0.1:${chromePort}/json/version`)).ok; } catch { return false; } }, 'Chrome');
  const target = await (await fetch(`http://127.0.0.1:${chromePort}/json/new?about:blank`, { method: 'PUT' })).json();
  socket = new WebSocket(target.webSocketDebuggerUrl); await new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; });
  let sequence = 0; const pending = new Map();
  function send(method, params = {}) { return new Promise((done, fail) => {
    const id = ++sequence; pending.set(id, { done, fail }); socket.send(JSON.stringify({ id, method, params }));
    setTimeout(() => { if (pending.delete(id)) fail(new Error('CDP timeout: ' + method)); }, 20000).unref();
  }); }
  socket.onmessage = event => {
    const msg = JSON.parse(event.data);
    if (msg.id) { const item = pending.get(msg.id); pending.delete(msg.id); if (msg.error) item?.fail(new Error(msg.error.message)); else item?.done(msg.result); }
    if (msg.method === 'Runtime.exceptionThrown') errors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    if (msg.method === 'Fetch.requestPaused') {
      const { requestId, request } = msg.params, url = new URL(request.url);
      if (url.origin !== base) { void send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }).catch(() => {}); return; }
      if (!url.pathname.startsWith('/api/')) { void send('Fetch.continueRequest', { requestId }).catch(() => {}); return; }
      const response = fixture(url, request.method);
      const isFeed = url.pathname === '/api/notifications', requestKey = url.search;
      if (isFeed) { const count = (activeRequests.get(requestKey) ?? 0) + 1; activeRequests.set(requestKey, count); peakConcurrentPageRequests = Math.max(peakConcurrentPageRequests, count); }
      const fulfill = async () => {
        const responseCode = response.httpStatus ?? 200;
        if (isFeed) activeRequests.set(requestKey, activeRequests.get(requestKey) - 1);
        try { await send('Fetch.fulfillRequest', { requestId, responseCode, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], ...(responseCode !== 204 ? { body: Buffer.from(JSON.stringify(response)).toString('base64') } : {}) }); }
        catch (error) { if (!/Invalid InterceptionId|Invalid state/.test(String(error))) errors.push(String(error)); }
      };
      if (delay && (isFeed || request.method === 'PUT')) setTimeout(() => { void fulfill(); }, delay); else void fulfill();
    }
  };
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); assert.ok(!r.exceptionDetails, r.exceptionDetails?.exception?.description ?? expression); return r.result.value; };
  const wait = (expression, label = expression) => until(() => evaluate(expression), label);
  const check = async (expression, label) => assert.equal(await evaluate(expression), true, label);
  const click = async selector => assert.equal(await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)return false;n.click();return true})()`), true, selector);
  const key = async (key, modifiers = 0) => { const windowsVirtualKeyCode = { Tab: 9, Escape: 27 }[key]; await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, modifiers, windowsVirtualKeyCode }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, modifiers, windowsVirtualKeyCode }); };
  const shot = async name => { await sleep(250); const result = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile(resolve(artifacts, name + '.png'), Buffer.from(result.data, 'base64')); };
  const countReads = () => requests.filter(request => request.method === 'PUT').length;
  const countGets = () => requests.filter(request => request.path === '/api/notifications').length;
  const bell = '.learning-notifications-trigger', dialog = 'dialog.learning-notification-panel';
  await send('Page.enable'); await send('Runtime.enable'); await send('Page.bringToFront');
  await send('Fetch.enable', { patterns: [{ urlPattern: 'http*' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: base + '/learning/courses/1/lessons/2' });
  await wait('!!document.querySelector(".workspace-topbar") && document.querySelector(".learning-notifications-trigger")?.textContent.includes("11")');
  const initialGets = countGets();
  await click(bell); await wait('document.querySelector("dialog.learning-notification-panel")?.open');
  await sleep(230);
  await check('Math.round(document.querySelector("dialog").getBoundingClientRect().width)===400', 'Compact desktop width');
  await check('document.querySelector("dialog").contains(document.activeElement)', 'Initial panel focus');
  assert.equal(countReads(), 0, 'Opening never marks read'); assert.equal(countGets(), initialGets, 'Fresh opening reuses loaded data');
  await check('document.querySelector("dialog").textContent.includes("Hôm nay") && document.querySelector("dialog").textContent.includes("Hôm qua")', 'Vietnam date grouping');
  await check('document.querySelectorAll("dialog .learning-notice").length===20', 'Distinct reminder records retained');
  await check('!document.querySelector("dialog a[href^=https]") && !window.notificationXss', 'Unsafe URL omitted and content escaped');
  await shot('notifications-desktop-1440');
  await key('Escape'); await wait('!document.querySelector("dialog").open');
  await check('document.activeElement===document.querySelector(".learning-notifications-trigger")', 'Escape restores bell focus');
  await click(bell); await wait('document.querySelector("dialog").open');
  await evaluate('document.querySelector("dialog .learning-notification-all").focus()'); await key('Tab');
  await wait('!document.querySelector("dialog").open');
  evidence.push('PASS: 400px desktop popover, date groups, distinct reminders retained, safe links/text, no read/refetch on opening, keyboard entry/Escape/Tab exit.');

  for (const width of [1024, 768, 375]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: width === 375 ? 760 : 900, deviceScaleFactor: 1, mobile: width === 375 });
    await click(bell); await wait('document.querySelector("dialog").open'); await sleep(250);
    await check('(()=>{const r=document.querySelector("dialog").getBoundingClientRect();return r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight && document.documentElement.scrollWidth<=innerWidth+1})()', `Panel within ${width}px viewport`);
    if (width === 375) {
      await check('document.querySelector("dialog").matches(":modal") && document.body.style.overflow==="hidden"', 'Accessible mobile modal and scroll lock');
      for (let index = 0; index < 18; index++) { await key('Tab'); await check('document.querySelector("dialog").contains(document.activeElement)', 'Mobile Tab focus trapped'); }
      await key('Tab', 8); await check('document.querySelector("dialog").contains(document.activeElement)', 'Mobile Shift Tab trapped');
    }
    await evaluate(`document.querySelector('dialog [aria-label="Đóng thông báo"]').focus();document.querySelector('dialog .notice-feed-scroll').scrollTop=0;`);
    await shot(`notifications-${width}`); await key('Escape'); await wait('!document.querySelector("dialog").open');
  }
  evidence.push('PASS: 1024/768/375px viewport bounds, mobile modal focus trap/scroll lock and responsive screenshots.');

  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await click(bell); await wait('document.querySelector("dialog").open');
  writeFailure = true;
  await evaluate('document.querySelector("dialog .notice-mark-read").focus()');
  await click('dialog .notice-mark-read');
  await wait('!!document.querySelector("dialog [role=alert]")');
  await check('document.activeElement.classList.contains("learning-notice")', 'Read action retains keyboard focus in its card');
  await check('document.querySelector(".learning-notifications-trigger").textContent.includes("11") && !!document.querySelector("dialog .learning-notice.is-unread")', 'Failed write preserves unread state');
  writeFailure = false; delay = 350;
  const beforeReads = countReads();
  await click('dialog .notice-mark-read'); await click('dialog .notice-mark-read');
  await wait('document.querySelector(".learning-notifications-trigger").textContent.includes("10")');
  assert.equal(countReads(), beforeReads + 1, 'Duplicate read clicks use one PUT'); delay = 0;
  await check('document.querySelector("dialog .learning-notice").classList.contains("is-read")', 'Read transition applied after server confirms');
  const readId = rows.find(row => row.id === 1).id;
  await click('dialog [aria-label="Làm mới thông báo"]');
  await wait('!document.querySelector("dialog .notice-feed-scroll").getAttribute("aria-busy").includes("true")');
  assert.equal(rows.find(row => row.id === readId).read, true);
  await click('dialog [aria-label="Thông báo sau"]');
  await wait('document.querySelector("dialog .learning-notification-pagination")?.textContent.includes("Trang 2 / 2")');
  await wait('!document.querySelector("dialog .notice-feed-scroll").getAttribute("aria-busy").includes("true")');
  await check('document.querySelectorAll("dialog .learning-notice").length===4', 'Second page preserved');
  await click('dialog [aria-label="Thông báo trước"]');
  await wait('document.querySelector("dialog .learning-notification-pagination")?.textContent.includes("Trang 1 / 2")');
  await click('dialog .notice-action');
  await wait('location.hash==="#notifications" && !!document.querySelector(".learning-notifications.is-page")');
  await check('!!document.querySelector(".learning-notifications.is-page .notice-content.is-expanded") && !window.notificationXss', 'Feedback action opens complete escaped reply');
  await check('document.querySelector(".learning-notifications.is-page .learning-notice").contains(document.activeElement)', 'Feedback destination focus');
  const getBeforeFullPageRefresh = countGets(); delay = 400;
  await evaluate('window.dispatchEvent(new Event("edujar:notifications")); window.dispatchEvent(new Event("edujar:notifications"));');
  await wait('!document.querySelector(".is-page .notice-feed-scroll").getAttribute("aria-busy").includes("true")'); delay = 0;
  assert.equal(countGets(), getBeforeFullPageRefresh + 1, 'Header and full-page share one request');
  await click('.is-page .notice-read-all');
  await wait('document.querySelector(".is-page .notice-count").textContent==="0 chưa đọc"');
  await check('!document.querySelector(".learning-notifications-trigger > span") && !document.querySelector(".is-page .is-unread")', 'Global count synchronized between inbox and bell');
  await shot('notifications-full-inbox');
  evidence.push('PASS: individual read failure/retry, duplicate click coalescing, refresh preserves read state, pagination, feedback navigation/full text/focus, shared requests and authoritative read-all count.');

  getFailure = true;
  await click('.is-page [aria-label="Làm mới thông báo"]'); await wait('!!document.querySelector(".is-page [role=alert]")');
  await check('document.querySelectorAll(".is-page .learning-notice").length===20', 'Refresh failure retains loaded rows');
  await shot('notifications-refresh-error'); getFailure = false;
  await click('.is-page .learning-notification-error button'); await wait('!document.querySelector(".is-page [role=alert]")');
  rows = [];
  await click('.is-page [aria-label="Làm mới thông báo"]'); await wait('document.querySelector(".is-page .learning-notification-empty")?.textContent.includes("Chưa có thông báo")');
  await shot('notifications-empty');
  studentId = 8; rows = makeRows(); delay = 1200;
  await send('Page.reload'); await wait('!!document.querySelector(".is-page .notice-skeleton")');
  await shot('notifications-loading');
  await wait('!!document.querySelector(".is-page .learning-notice")'); delay = 0;
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await check('getComputedStyle(document.querySelector(".is-page .learning-notice")).transitionDuration==="0s"', 'Reduced motion respected');
  assert.equal(peakConcurrentPageRequests, 1, 'No overlapping requests for the same feed page');
  assert.deepEqual(errors, []);
  evidence.push('PASS: refresh error/retry with retained data, empty/loading states, reduced motion, no overlapping duplicate GETs or browser exceptions.');
  console.log(evidence.join('\n'));
} finally {
  if (errors.length) console.error(errors);
  socket?.close(); chrome.kill(); vite.kill();
  await writeFile(resolve(artifacts, 'summary.txt'), evidence.join('\n') + '\n');
}
