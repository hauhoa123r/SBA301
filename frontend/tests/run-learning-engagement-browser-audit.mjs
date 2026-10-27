// Production routes/components in Chrome with intercepted API fixtures only.
// Backend correctness is tested separately against the private MySQL runner.
// node frontend/tests/run-admin-browser-audit.mjs [artifact-directory]
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { openSync, closeSync } from "node:fs";
import { resolve } from "node:path";
import { createServer } from "node:net";
import assert from "node:assert/strict";

const frontend = resolve(process.env.ENGAGEMENT_AUDIT_FRONTEND ?? resolve(import.meta.dirname, ".."));
const artifacts = resolve(process.argv[2] ?? "backend/target/learning-engagement-browser");
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
let socket; const evidence=[], errors=[], requests=[];
let apiDelayMs=0, admin=false, studentId=7, reply="";
const notices=new Map(), dailyCreated=new Map();
const suggestion={courseId:1,lessonId:2,courseTitle:"Sales",lessonTitle:"Lesson next",path:"/learning/courses/1/lessons/2"};
function rows(id=studentId){if(!notices.has(id)) notices.set(id,[]);return notices.get(id);}
function fixture(url,method,body){
 const path=url.pathname;requests.push({path,method});
 if(path==='/api/auth/csrf')return {token:'fixture'};
 if(path==='/api/auth/refresh')return {accessToken:'fixture-only-no-backend',user:{id:admin?1:studentId,fullName:'Learner fixture',email:'learner@example.test',roles:[admin?'ADMIN':'STUDENT']}};
 if(path==='/api/learning/stats')return {studentName:'Learner fixture',enrolledCourses:[]};
 if(path==='/api/learning/streak')return {current:3,longest:7,activeToday:true,lastActivityDate:'2026-10-27',timezone:'Asia/Ho_Chi_Minh'};
 if(path==='/api/learning/activity')return [];
 if(path==='/api/notifications/recommendation')return {recommendation:suggestion,created:false};
 if(path==='/api/notifications/daily-study'){
  const created=!dailyCreated.has(studentId);if(created){dailyCreated.set(studentId,1);rows().push({id:1,type:'STUDY_REMINDER',title:'Daily lesson',content:'Lesson next - Sales',createdAt:'2026-10-27T01:00:00Z',read:false,path:suggestion.path});}
  return {created,recommendation:suggestion};
 }
 if(path==='/api/notifications')return {content:[...rows()].reverse(),unreadCount:rows().filter(n=>!n.read).length,totalPages:1,page:0};
 if(path==='/api/notifications/read' && method==='PUT'){rows().forEach(n=>n.read=true);return {};}
 if(/^\/api\/notifications\/\d+\/read$/.test(path) && method==='PUT'){const id=Number(path.split('/')[3]);rows().find(n=>n.id===id).read=true;return {};}
 const message={id:1,fullName:'Learner fixture',email:'learner@example.test',topic:'Kh?c',message:'Question from learner',status:reply?'RESOLVED':'NEW',createdAt:'2026-10-27T00:00:00Z',registeredSender:true,reply:reply||null,repliedAt:reply?'2026-10-27T02:00:00Z':null};
 if(path==='/api/admin/contact-messages/1/reply' && method==='PUT'){
  reply=JSON.parse(body).text;rows(7).push({id:2,type:'FEEDBACK_REPLY',title:'Feedback answered',content:reply,createdAt:'2026-10-27T02:00:00Z',read:false,path:'/learning#notifications'});return {...message,reply};
 }
 if(path==='/api/admin/contact-messages/statistics')return {totalReceived:1,unreadCount:reply?0:1,resolvedCount:reply?1:0,categories:[]};
 if(path==='/api/admin/contact-messages')return {content:[message],totalElements:1,totalPages:1,page:0,unreadCount:reply?0:1};
 return {unhandled:path};
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
  await send("Page.bringToFront");
  await send("Fetch.enable", { patterns: [{ urlPattern: `${base}/api/*` }] });
  await send("Emulation.setDeviceMetricsOverride", { width:1440,height:1000,deviceScaleFactor:1,mobile:false });
  await go("/learning#profile", "Chuỗi ngày học của bạn");
  await until(()=>evaluate("document.querySelector('.learning-streak-number')?.textContent.includes('3') && !!document.querySelector('.learning-recommendation a[href=\"/learning/courses/1/lessons/2\"]')"),"Streak and recommendation loaded");
  assert.equal(await evaluate("document.querySelector('.learning-streak-badge span').textContent"),"3");
  assert.equal(await evaluate("document.body.textContent.includes('Kỷ lục: 7 ngày')"),true);
  await until(()=>dailyCreated.get(7)===1,"Daily reminder created");
  await evaluate("document.querySelector('[aria-controls=\"learning-notification-feed\"]').click();true");
  await until(()=>evaluate("document.querySelector('.learning-notice')?.textContent.includes('Lesson next')"),"Notification dropdown loaded");
  await send("Input.dispatchKeyEvent",{type:"keyDown",key:"Escape",code:"Escape"});
  assert.equal(await evaluate("document.activeElement?.getAttribute('aria-controls')"),"learning-notification-feed");
  assert.equal(await evaluate("document.querySelector('.learning-notification-panel')===null"),true);
  await go("/learning#profile","Chuỗi ngày học của bạn");
  await send("Page.reload",{ignoreCache:true});
  await until(()=>requests.filter(r=>r.path==='/api/notifications/daily-study').length>=2,"Repeated session reminder request");
  assert.equal(rows(7).filter(n=>n.type==='STUDY_REMINDER').length,1);
  evidence.push("PASS: saved streak/current/best rendered; next lesson link targets saved progress; no duplicate daily item after session reload; bell opens and Escape restores focus.");
  for(const width of [1440,390]){
    await send("Emulation.setDeviceMetricsOverride",{width,height:1000,deviceScaleFactor:1,mobile:width<500});
    await sleep(300);
    assert.equal(await evaluate("document.documentElement.scrollWidth<=innerWidth+1"),true,`No profile horizontal overflow at ${width}`);
    const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true});
    await writeFile(resolve(artifacts,`profile-${width}.png`),Buffer.from(shot.data,"base64"));
  }
  admin=true;
  await send("Emulation.setDeviceMetricsOverride",{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await go("/admin/feedback","Question from learner");
  await click("Trả lời góp ý");await input(".feedback-reply-compose textarea","Xin chào! <script>window.replyXss=true</script> Đây là câu trả lời.");
  await click("Gửi trả lời");await until(()=>evaluate("!!document.querySelector('.feedback-reply')"),"Admin reply saved and displayed");
  assert.equal(await evaluate("window.replyXss===true"),false);
  admin=false;
  await go("/learning#notifications","Thông báo");
  await until(()=>evaluate("document.querySelector('.learning-notifications.is-page')?.textContent.includes('Đây là câu trả lời.')"),"Sender receives feedback reply");
  assert.equal(await evaluate("window.replyXss===true"),false);
  await click("Đọc tất cả");await until(()=>evaluate("document.querySelector('.learning-notifications.is-page h2')?.textContent.includes('0 chưa đọc')"),"Read-all updates badge");
  const shot=await send("Page.captureScreenshot",{format:"png",captureBeyondViewport:true});
  await writeFile(resolve(artifacts,"notifications.png"),Buffer.from(shot.data,"base64"));
  studentId=8;
  await send("Page.reload",{ignoreCache:true});
  await until(()=>evaluate("!!document.querySelector('.learning-notice')"),"Second account own daily item");
  assert.equal(await evaluate("document.body.textContent.includes('Đây là câu trả lời.')"),false);
  assert.deepEqual(errors,[]);
  evidence.push("PASS: admin reply form persists fixture reply; sender sees reply in notification center; content escaped, read-all refreshes unread count, account switch clears private feed; profile responsive at 1440/390px.");
  console.log(evidence.join("\n"));
} finally {
  socket?.close();chrome.kill();vite.kill();
  await writeFile(resolve(artifacts,"browser-summary.txt"),evidence.join("\n")+"\n","utf8");
}
