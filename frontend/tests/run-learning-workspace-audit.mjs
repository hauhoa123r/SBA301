// Local UI regression only. All API/media responses are isolated fixtures; no production writes.
// node frontend/tests/run-learning-workspace-audit.mjs [artifact-directory] [--baseline]
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createServer } from 'node:net';
import assert from 'node:assert/strict';

const frontend = resolve(import.meta.dirname, '..');
const artifacts = resolve(process.argv[2] ?? 'backend/target/learning-workspace-audit');
const baseline = process.argv.includes('--baseline');
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
let socket, videoData, courseFailure = 0, writeFailure = false, courseDelay = 0;
const evidence = [], errors = [], requests = [];
const quiz = { id: 302, title: 'Ôn tập: Gặp trưởng nhóm', timeLimitMinutes: 5, passScore: 60, questions: [{ id: 501, questionType: 'SINGLE_CHOICE', content: '“您好” có nghĩa là gì?', points: 10, answers: [{ id: 601, content: 'Xin chào' }, { id: 602, content: 'Tạm biệt' }] }] };
const words = [{ id: 1, hanzi: '您好', pinyin: 'nín hǎo', vietnameseMeaning: 'Xin chào (lịch sự)' }, { id: 2, hanzi: '同事', pinyin: 'tóngshì', vietnameseMeaning: 'Đồng nghiệp' }];
function lesson(id, title, orderIndex, extra = {}) { return { id, title, orderIndex, durationSeconds: 840, documents: [], vocabularies: words, sentencePatterns: [{ id: 1, chineseText: '您好！我是新来的员工。', pinyinText: 'Nín hǎo! Wǒ shì xīn lái de yuángōng.', vietnameseMeaning: 'Xin chào! Tôi là nhân viên mới.' }], ...extra }; }
function course() { return { id: 1, title: 'Tiếng Trung giao tiếp cho Nhân viên Sales', teacherName: 'Edujar', chapters: [
  { id: 10, orderIndex: 1, title: 'Làm quen với môi trường làm việc', lessons: [lesson(101, 'Gặp lễ tân', 1, { videoUrl: videoData }), lesson(102, 'Gặp trưởng nhóm', 2, { videoUrl: videoData, quiz, quizzes: [quiz], documents: [{ id: 1, title: 'Từ vựng & hội thoại — Gặp trưởng nhóm.pdf', fileUrl: `${base}/fixture-resource.pdf` }] })], quizzes: [], assignments: [] },
  { id: 20, orderIndex: 2, title: 'Giới thiệu bản thân với khách hàng', lessons: [lesson(201, 'Giới thiệu bản thân', 1, { content: 'HỘI THOẠI\n\n您好！我是新来的员工。\nNín hǎo! Wǒ shì xīn lái de yuángōng.\nXin chào! Tôi là nhân viên mới.' }), lesson(202, 'Giới thiệu công ty', 2, { vocabularies: [], sentencePatterns: [] })], quizzes: [], assignments: [{ id: 401, title: 'Thực hành giới thiệu bản thân', description: 'Viết lời giới thiệu ngắn bằng tiếng Trung.' }] },
  { id: 30, orderIndex: 3, title: 'Trao đổi và xây dựng quan hệ', lessons: [], quizzes: [], assignments: [] },
] }; }
let progress = { courseId: 1, completedLessonIds: [101], completedChapterIds: [], passedQuizIds: [], submittedAssignmentIds: [], completedActivities: 1, progressPercent: 17, lessonPlayback: [{ lessonId: 102, positionSeconds: 1, watchSeconds: 60 }], quizResults: [], assignmentSubmissions: [] };
function fixture(url, method, body) {
  const path = url.pathname; requests.push({ path, method, body });
  if (path === '/api/auth/csrf') return { token: 'fixture' };
  if (path === '/api/auth/refresh') return { accessToken: 'local-fixture-only', user: { id: 7, fullName: 'Minh Anh', email: 'learner@example.test', roles: ['STUDENT'] } };
  if (path === '/api/notifications/daily-study') return { recommendation: null, created: false };
  if (path === '/api/notifications') return { content: [], unreadCount: 0, totalPages: 0, page: 0 };
  if (path === '/api/learning/courses/1') return courseFailure ? { httpStatus: courseFailure, message: 'Không thể tải khóa học. Vui lòng thử lại.' } : course();
  if (path === '/api/learning/courses/1/progress') return progress;
  if (path.endsWith('/playback') && method === 'PUT') return JSON.parse(body);
  if (path.endsWith('/progress') && method === 'PUT') {
    if (writeFailure) return { httpStatus: 500, message: 'Không thể lưu tiến độ. Vui lòng thử lại.' };
    const id = Number(path.split('/')[6]);
    progress = { ...progress, completedLessonIds: JSON.parse(body).completed ? [...new Set([...progress.completedLessonIds, id])] : progress.completedLessonIds.filter(item => item !== id) };
    progress.completedActivities = progress.completedLessonIds.length; progress.progressPercent = Math.round(progress.completedActivities / 6 * 100);
    return progress;
  }
  if (path.endsWith('/quizzes/302/submissions')) { progress = { ...progress, passedQuizIds: [302], quizResults: [{ quizId: 302, isPassed: true, score: 100, answers: [], review: [] }] }; return progress; }
  if (path.endsWith('/assignments/401/submission')) { progress = { ...progress, submittedAssignmentIds: [401], assignmentSubmissions: [{ assignmentId: 401, text: JSON.parse(body).text, status: 'SUBMITTED' }] }; return progress; }
  if (path === '/api/subscriptions/plans') return [];
  if (path === '/api/subscriptions/me') return { planCode: null, active: false, trialAvailable: false, expiresAt: null, legacyCourseIds: [] };
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
    if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') console.error('Browser:', msg.params.args.map(arg => arg.description ?? arg.value).join(' '));
    if (msg.method === 'Fetch.requestPaused') {
      const { requestId, request } = msg.params;
      const url = new URL(request.url);
      // Block all external traffic. Only the local Vite server and fixture data can load.
      if (url.origin !== base) { void send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }).catch(() => {}); return; }
      if (!url.pathname.startsWith('/api/')) { void send('Fetch.continueRequest', { requestId }).catch(() => {}); return; }
      const response = fixture(url, request.method, request.postData);
      const fulfill = () => send('Fetch.fulfillRequest', { requestId, responseCode: response.httpStatus ?? 200, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from(JSON.stringify(response)).toString('base64') }).catch(() => {});
      if (courseDelay && url.pathname === '/api/learning/courses/1') setTimeout(fulfill, courseDelay); else void fulfill();
    }
  };
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); assert.ok(!r.exceptionDetails, r.exceptionDetails?.exception?.description ?? expression); return r.result.value; };
  const click = async selector => assert.equal(await evaluate(`(()=>{const n=document.querySelector(${JSON.stringify(selector)});if(!n)return false;n.click();return true})()`), true, selector);
  const clickText = async text => assert.equal(await evaluate(`(()=>{const n=[...document.querySelectorAll('button')].find(n=>n.textContent.trim()===${JSON.stringify(text)});if(!n||n.disabled)return false;n.click();return true})()`), true, text);
  const check = async (expression, label) => { assert.equal(await evaluate(expression), true, label); };
  const wait = (expression, label = expression) => until(() => evaluate(expression), label);
  const key = async (key, code = key, modifiers = 0) => { const windowsVirtualKeyCode = { Tab: 9, Escape: 27, Home: 36, End: 35, ArrowRight: 39 }[key]; await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, modifiers, windowsVirtualKeyCode }); await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, modifiers, windowsVirtualKeyCode }); };
  const go = async (path = '/learning/courses/1/lessons/102') => { await send('Page.navigate', { url: base + path }); await until(() => evaluate('!!document.querySelector("#learn-course-navigation")'), path); };
  const screenshot = async name => { await sleep(350); const shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false }); await writeFile(resolve(artifacts, name + '.png'), Buffer.from(shot.data, 'base64')); };
  await send('Page.enable'); await send('Runtime.enable'); await send('Page.bringToFront');
  // A small real WebM makes native seek/pause/tab preservation testable without network video.
  videoData = await evaluate(`(async()=>{const c=document.createElement('canvas');c.width=1280;c.height=720;const g=c.getContext('2d');g.fillStyle='#11263c';g.fillRect(0,0,1280,720);g.fillStyle='#45a5ff';g.fillRect(84,100,4,60);g.font='22px sans-serif';g.fillText('EDUJAR  /  TIẾNG TRUNG GIAO TIẾP',110,140);g.fillStyle='#f1f6ff';g.font='bold 60px sans-serif';g.fillText('您好！我是新来的员工。',110,320);g.fillStyle='#91b6dd';g.font='30px sans-serif';g.fillText('Nín hǎo! Wǒ shì xīn lái de yuángōng.',110,395);g.fillStyle='#e0e9f4';g.font='26px sans-serif';g.fillText('Xin chào! Tôi là nhân viên mới.',110,470);g.fillStyle='#7d9ab7';g.font='18px sans-serif';g.fillText('VIDEO KIỂM THỬ GIAO DIỆN · KHÔNG PHẢI DỮ LIỆU THẬT',110,635);const mime=MediaRecorder.isTypeSupported('video/mp4')?'video/mp4':'video/webm';const stream=c.captureStream(10),rec=new MediaRecorder(stream,{mimeType:mime}),chunks=[];rec.ondataavailable=e=>chunks.push(e.data);const done=new Promise(resolve=>rec.onstop=resolve);rec.start();let frame=0;const timer=setInterval(()=>{g.fillStyle=frame++%2?'#11263c':'#12273d';g.fillRect(0,0,2,2);},100);await new Promise(r=>setTimeout(r,6000));clearInterval(timer);rec.stop();await done;stream.getTracks().forEach(t=>t.stop());return await new Promise(r=>{const reader=new FileReader();reader.onload=()=>r(reader.result);reader.readAsDataURL(new Blob(chunks,{type:mime}));});})()`);
  await send('Fetch.enable', { patterns: [{ urlPattern: 'http*' }] });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await go();
  await until(() => evaluate('document.querySelector("video")?.readyState >= 2'), 'video ready');
  await evaluate('document.querySelector("video").muted=true; document.querySelector("video").play().then(()=>document.querySelector("video").pause())');
  for (const width of [1440, 1024, 768, 375]) {
    await send('Emulation.setDeviceMetricsOverride', { width, height: width < 500 ? 850 : 1000, deviceScaleFactor: 1, mobile: width < 500 });
    await screenshot(`${baseline ? 'before' : 'after'}-${width}`);
    if (!baseline) assert.equal(await evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), true, `No overflow at ${width}`);
  }
  evidence.push('PASS: local fixture screenshots at 375/768/1024/1440px.');
  if (!baseline) {
    // Native mobile dialog: keyboard focus stays inside, Escape restores its opener.
    const toggle = '.workspace-topbar button[aria-controls="learn-course-navigation"]';
    await evaluate(`document.querySelector('${toggle}').focus()`);
    await click(toggle);
    await wait('document.querySelector("#learn-course-navigation")?.open');
    await check('document.querySelector("#learn-course-navigation").contains(document.activeElement)', 'Drawer initial focus');
    for (let i = 0; i < 14; i++) { await key('Tab'); await check('document.querySelector("#learn-course-navigation").contains(document.activeElement)', 'Drawer traps Tab'); }
    await key('Tab', 'Tab', 8);
    await check('document.querySelector("#learn-course-navigation").contains(document.activeElement)', 'Drawer traps Shift+Tab');
    await screenshot('after-mobile-drawer');
    await key('Escape');
    await wait('!document.querySelector("#learn-course-navigation")?.open');
    await check(`document.activeElement === document.querySelector('${toggle}')`, 'Drawer restores focus');
    evidence.push('PASS: mobile drawer keyboard focus trap, Escape, focus restoration.');

    // Real media node/time, keyboard tabs, card position survive switching activities.
    await evaluate('window.originalVideo=document.querySelector("video"); window.originalVideo.currentTime=2;');
    await wait('!document.querySelector("video").seeking');
    await evaluate('document.querySelector("#lesson-tab-video").focus()');
    await key('ArrowRight');
    await wait('document.querySelector("#lesson-tab-vocabulary").getAttribute("aria-selected")==="true"');
    await check('document.activeElement.id === "lesson-tab-vocabulary"', 'Tab arrow focus follows selection');
    await click('[aria-label="Xem từ vựng tiếp theo"]');
    await wait('document.querySelector("#lesson-panel-vocabulary").textContent.includes("(2/2)")');
    await check('getComputedStyle(document.querySelector("#lesson-panel-vocabulary [role=button] > div")).display !== "none"', 'Mobile flashcard face visible');
    await click('#lesson-panel-vocabulary [role="button"]');
    await wait('document.querySelector("#lesson-panel-vocabulary [role=button]").getAttribute("aria-pressed")==="true"');
    await screenshot('after-mobile-flashcard');
    await click('#lesson-tab-sentence');
    await screenshot('after-mobile-sentences');
    await click('#lesson-tab-vocabulary');
    await check('document.querySelector("#lesson-panel-vocabulary").textContent.includes("(2/2)") && document.querySelector("#lesson-panel-vocabulary [role=button]").getAttribute("aria-pressed")==="true"', 'Card and flip preserved');
    await evaluate('document.querySelector("#lesson-tab-vocabulary").focus()');
    await key('Home');
    await wait('document.querySelector("#lesson-tab-video").getAttribute("aria-selected")==="true"');
    await check('document.querySelector("video")===window.originalVideo && Math.abs(window.originalVideo.currentTime-2)<.2', 'Same video node and time');
    await evaluate('document.querySelector("video").muted=true; document.querySelector("video").play()');
    await click('#lesson-tab-vocabulary');
    await wait('document.querySelector("video").paused');
    await until(() => requests.some(r => r.path.endsWith('/102/playback') && JSON.parse(r.body).positionSeconds >= 2), 'Playback flush');
    await click('#lesson-tab-video');
    assert.equal(requests.filter(r => r.method === 'PUT' && r.path.endsWith('/progress')).length, 0, 'Presentation changes never complete a lesson');
    evidence.push('PASS: keyboard tabs, video position/node retained, hidden media paused, playback save, flashcard flip/index retained.');

    // Focus mode and chapter expansion are presentation-only.
    await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
    await wait('!!document.querySelector("aside.workspace-sidebar")');
    await click('.workspace-focus-button');
    await wait('!!document.querySelector(".is-focus")');
    await check('document.querySelector("aside").inert && getComputedStyle(document.querySelector(".workspace-resources")).display==="none" && document.querySelector("video")===window.originalVideo', 'Focus hides distractions without remount');
    await evaluate('window.scrollTo(0,0)');
    await screenshot('after-focus');
    await click('.workspace-focus-button');
    await wait('!!document.querySelector(".has-sidebar")');
    await click('[aria-controls="chapter-content-10"]');
    await wait('document.querySelector("#chapter-content-10").inert');
    await check('location.pathname.endsWith("/lessons/102")', 'Chapter collapse does not navigate');
    await click('[aria-controls="chapter-content-10"]');
    await click('.workspace-resources summary');
    await check(`document.querySelector('.workspace-resources').open && document.querySelector('.workspace-resource-list a').href===${JSON.stringify(base + '/fixture-resource.pdf')}`, 'Resource link preserved');
    evidence.push('PASS: Focus Mode, collapsible chapters/resources, unchanged resource URL.');

    // Failure does not falsely mark completion; retry uses the existing API and server result.
    writeFailure = true;
    await click('.workspace-action-buttons .workspace-primary-button');
    await wait('!!document.querySelector(".workspace-error[role=alert]")');
    await check('document.querySelector(".workspace-action-buttons .workspace-primary-button").getAttribute("aria-pressed")==="false"', 'Failed completion remains incomplete');
    writeFailure = false;
    await click('.workspace-action-buttons .workspace-primary-button');
    await wait('document.querySelector(".workspace-action-buttons .workspace-primary-button").getAttribute("aria-pressed")==="true"');
    assert.ok(progress.completedLessonIds.includes(102));
    await click('.workspace-action-buttons .workspace-primary-button');
    await wait('document.querySelector(".workspace-action-buttons .workspace-primary-button").getAttribute("aria-pressed")==="false"');
    // Let the actual native media reach its end (no synthetic completion event).
    await evaluate('const v=document.querySelector("video"); v.currentTime=0; v.playbackRate=8; v.play()');
    await wait('document.querySelector("video").ended', 'Native video ends');
    await wait('document.querySelector(".workspace-action-buttons .workspace-primary-button").getAttribute("aria-pressed")==="true"');
    evidence.push('PASS: completion API error/retry, manual toggle and native video-ended completion.');

    await clickText('Làm trắc nghiệm');
    await wait('!!document.querySelector("input[type=radio]")');
    await click('input[type=radio]');
    await clickText('Nộp trắc nghiệm');
    await wait('document.body.textContent.includes("Kết quả đã lưu: 100%")');
    await clickText('Làm lại bài kiểm tra');
    await wait('!document.querySelector("input[type=radio]").checked');
    assert.ok(requests.some(r => r.path.endsWith('/quizzes/302/submissions') && r.method === 'POST'));
    await clickText('Quay lại bài học');
    await wait('!!document.querySelector(".workspace-next-lesson")');
    await click('.workspace-next-lesson');
    await wait('location.pathname.endsWith("/lessons/201") && !!document.querySelector("#lesson-panel-reading")');
    await check('document.querySelector("#lesson-panel-reading").hidden===false && !document.querySelector(".workspace-resources")', 'Reading default, no empty resource section');
    await check('document.querySelector("[aria-controls=chapter-content-20]").getAttribute("aria-expanded")==="true"', 'Next chapter opens automatically');
    await screenshot('after-reading');
    await click('.workspace-next-lesson');
    await wait('location.pathname.endsWith("/lessons/202") && document.querySelector("h1")?.textContent === "Giới thiệu công ty" && !!document.querySelector("#lesson-panel-video .workspace-empty")');
    await check('document.querySelector(".workspace-next-lesson").disabled && document.body.textContent.includes("Video chưa có sẵn")', 'Last lesson disabled / no video fallback');
    await click('#lesson-tab-vocabulary');
    await check('document.querySelector("#lesson-panel-vocabulary").textContent.includes("Chưa có từ vựng")', 'Empty vocabulary');
    await click('#lesson-tab-sentence');
    await check('!!document.querySelector("#lesson-panel-sentence .workspace-empty")', 'Empty sentence patterns');
    await clickText('Thực hành giới thiệu bản thânBài tập thực hành');
    await wait('!!document.querySelector("textarea")');
    await evaluate(`(()=>{const n=document.querySelector('textarea');Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(n,'你好！我是新来的员工。');n.dispatchEvent(new Event('input',{bubbles:true}));})()`);
    await clickText('Nộp bài tập');
    await wait('document.body.textContent.includes("Đã lưu bài nộp")');
    assert.ok(requests.some(r => r.path.endsWith('/assignments/401/submission') && r.method === 'PUT'));
    evidence.push('PASS: quiz submit/retake, assignment submission, sequential lesson navigation, reading and empty states.');

    await go('/learning/courses/1/lessons/101');
    await check('document.querySelector(".workspace-lesson-navigation button").disabled', 'First lesson previous disabled');
    await wait('document.querySelector("video")?.readyState>=2');
    await evaluate('document.querySelector("video").dispatchEvent(new Event("error"))');
    await wait('!!document.querySelector(".workspace-video-error")');
    await screenshot('after-video-error');
    await clickText('Tải lại video');
    await wait('!document.querySelector(".workspace-video-error") && document.querySelector("video").readyState>=2');
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await check('getComputedStyle(document.querySelector(".workspace-enter")).animationName==="none" && getComputedStyle(document.querySelector(".workspace-chevron")).transitionDuration==="0s"', 'Reduced motion');
    await send('Emulation.setEmulatedMedia', { features: [] });
    courseDelay = 1800;
    await send('Page.navigate', { url: base + '/learning/courses/1/lessons/102' });
    await wait('!!document.querySelector(".workspace-loading[aria-busy=true]")');
    await screenshot('after-loading');
    await wait('!!document.querySelector("#learn-course-navigation")'); courseDelay = 0;
    courseFailure = 500;
    await send('Page.navigate', { url: base + '/learning/courses/1/lessons/102' });
    await wait('document.querySelector("h1")?.textContent==="Không thể tải khóa học"');
    courseFailure = 0; await clickText('Tải lại');
    await wait('!!document.querySelector("#learn-course-navigation")');
    courseFailure = 403;
    await send('Page.navigate', { url: base + '/learning/courses/1/lessons/102' });
    await wait('location.pathname==="/subscriptions"');
    await check('!document.querySelector(".workspace-lesson-panel")', 'Denied access does not render lesson');
    evidence.push('PASS: video retry, loading/error/retry states, reduced motion, course access denial redirects to subscriptions.');
  }
  assert.deepEqual(errors, []);
  console.log(evidence.join('\n'));
} finally {
  if (errors.length) console.error(errors);
  socket?.close(); chrome.kill(); vite.kill();
  await writeFile(resolve(artifacts, 'summary.txt'), evidence.join('\n') + '\n');
}
