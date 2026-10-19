// No downloaded browser/automation dependency: Chrome DevTools Protocol over Node WebSocket.
// Invoked only by PostRefactorAuthHttpTest with an isolated H2 server and synthetic user.
import { spawn } from "node:child_process";
import { openSync, closeSync } from "node:fs";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const frontend = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const artifacts = resolve(process.argv[4]);
const base = "http://127.0.0.1:5197";
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(resolve(artifacts, "chrome-profile-"));
const email = process.argv[3];
const chromePath = process.env.AUTH_AUDIT_CHROME ?? "C:/Program Files/Google/Chrome/Application/chrome.exe";
const children = [];
const connections = [];
const evidence = [];
const sleep = ms => new Promise(done => setTimeout(done, ms));
async function until(action, label, timeout = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try { if (await action()) return; } catch { /* Service or page is starting. */ }
    await sleep(100);
  }
  throw new Error("Timed out: " + label);
}
function launch(command, args, options = {}) {
  const log = openSync(resolve(artifacts, "child-" + children.length + ".log"), "a");
  const child = spawn(command, args, { windowsHide: true, stdio: ["ignore", log, log], ...options });
  closeSync(log);
  children.push(child);
  return child;
}
async function connect(url) {
  const socket = new WebSocket(url);
  await Promise.race([new Promise((done, fail) => { socket.onopen = done; socket.onerror = fail; }),
    sleep(10000).then(() => { throw new Error("Chrome CDP connection timeout"); })]);
  let id = 0;
  const pending = new Map();
  const events = [];
  const pauses = [];
  socket.onclose = () => { pending.forEach(handler => handler.reject(new Error("Chrome CDP closed"))); pending.clear(); };
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const handler = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) handler?.reject(new Error(message.error.message));
      else handler?.resolve(message.result);
    } else if (message.method === "Fetch.requestPaused") {
      pauses.push(message.params);
    } else if (message.method === "Network.responseReceived") {
      events.push({ url: message.params.response.url, status: message.params.response.status });
    }
  };
  const connection = {
    events,
    pauses,
    send(method, params = {}) {
      return new Promise((resolve, reject) => {
        const requestId = ++id;
        pending.set(requestId, { resolve, reject });
        socket.send(JSON.stringify({ id: requestId, method, params }));
        setTimeout(() => {
          if (pending.delete(requestId)) reject(new Error("Chrome CDP command timeout: " + method));
        }, 20000).unref();
      });
    },
    async evaluate(expression) {
      const result = await this.send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
      // Do not print exception descriptions or remote objects: they can contain HTTP credentials.
      if (result.exceptionDetails) throw new Error("Browser expression failed (details withheld)");
      return result.result.value;
    },
    close() { socket.close(); },
  };
  connections.push(connection);
  return connection;
}
async function startChrome() {
  const probe = createServer();
  await new Promise(done => probe.listen(0, "127.0.0.1", done));
  const port = probe.address().port;
  await new Promise(done => probe.close(done));
  const process = launch(chromePath, ["--headless=new", "--disable-gpu", "--in-process-gpu", "--disable-background-networking", "--disable-component-update", "--no-first-run", "--no-default-browser-check",
    "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "about:blank"]);
  await until(async () => {
    return (await fetch("http://127.0.0.1:" + port + "/json/version", { signal: AbortSignal.timeout(2000) })).ok;
  }, "Chrome CDP");
  return { process, port };
}
async function tab(port) {
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  const page = await connect(target.webSocketDebuggerUrl);
  await page.send("Network.enable");
  await page.send("Page.enable");
  await page.send("Page.navigate", { url: base + "/tests/auth-audit.html" });
  await until(() => page.evaluate("!!window.audit && !audit.snapshot().initializing"), "AuthProvider initialization");
  return page;
}
async function reload(page, authenticated) {
  const previous = await page.evaluate("audit.documentId");
  await page.send("Page.reload", { ignoreCache: true });
  await until(() => page.evaluate(`!!window.audit && audit.documentId !== ${JSON.stringify(previous)} && !audit.snapshot().initializing && audit.snapshot().authenticated === ${authenticated}`), "new document after F5");
}
const mark = message => { evidence.push("PASS: " + message); console.log("PASS: " + message); };
try {
  console.log("Starting isolated Vite server");
  launch(process.execPath, ["node_modules/vite/bin/vite.js", "--config", "tests/auth-audit.vite.config.ts"], {
    cwd: frontend, env: { ...process.env, AUTH_AUDIT_API_URL: process.argv[2] },
  });
  await until(async () => (await fetch(base + "/tests/auth-audit.html", { signal: AbortSignal.timeout(2000) })).ok, "isolated Vite");
  console.log("Starting isolated Chrome profile");
  let chrome = await startChrome();
  const a = await tab(chrome.port);
  assert.equal(await a.evaluate("audit.snapshot().authenticated"), false);
  assert.equal(a.events.filter(e => e.url.endsWith("/api/auth/refresh")).length, 1);
  mark("AuthProvider StrictMode initializes once; anonymous protected route resolves to login");
  assert.equal(await a.evaluate(`audit.login(${JSON.stringify(email)})`), true);
  await until(() => a.evaluate("document.querySelector('#identity')?.textContent === 'authenticated'"), "login render");
  await reload(a, true);
  mark("login -> React render -> F5 restores authenticated user using real HttpOnly cookie");
  const cookies = (await a.send("Network.getCookies", { urls: [base + "/api/auth/refresh"] })).cookies;
  const refreshCookie = cookies.find(c => c.name === "refresh_session");
  assert.ok(refreshCookie?.httpOnly && refreshCookie.path === "/api/auth" && refreshCookie.sameSite === "Lax");
  assert.equal(await a.evaluate("history.replaceState({}, '', '/api/auth/audit'); !document.cookie.split(';').some(c => c.trim().startsWith('refresh_session='))"), true);
  assert.equal(await a.evaluate("['token','refreshToken','user'].every(k => localStorage.getItem(k) === null && sessionStorage.getItem(k) === null)"), true);
  mark("Chrome enforces HttpOnly at matching cookie path; legacy auth storage keys absent");
  const beforeBurst = a.events.filter(e => e.url.endsWith("/api/auth/refresh")).length;
  assert.equal(await a.evaluate("audit.burst401()"), true);
  await until(() => a.events.filter(e => e.url.endsWith("/api/auth/refresh")).length - beforeBurst === 1, "one refresh for browser burst");
  assert.equal(a.events.filter(e => e.url.endsWith("/api/auth/refresh")).length - beforeBurst, 1);
  mark("twelve actual HTTP 401s produce one refresh and twelve successful bounded retries");
  const b = await tab(chrome.port);
  const c = await tab(chrome.port);
  assert.ok(await b.evaluate("audit.snapshot().authenticated") && await c.evaluate("audit.snapshot().authenticated"));
  const rotations = await Promise.all([b.evaluate("audit.refresh()"), c.evaluate("audit.refresh()")]);
  assert.deepEqual(rotations, [true, true]);
  assert.ok([...a.events, ...b.events, ...c.events].filter(e => e.url.endsWith("/api/auth/refresh")).every(e => e.status === 200 || e.status === 401));
  mark("three real tabs restore one session; concurrent tab refreshes serialize through Web Locks without 409");
  await b.send("Fetch.enable", { patterns: [{ urlPattern: "*/api/auth/refresh", requestStage: "Response" }] });
  await b.evaluate("window.pendingRefresh = audit.refresh().catch(() => false); true");
  await until(() => b.pauses.length > 0, "hold old refresh response");
  await a.evaluate("window.pendingLogout = audit.logout(); true");
  await until(() => b.evaluate("!audit.snapshot().authenticated"), "logout intent before old refresh response");
  await b.send("Fetch.continueResponse", { requestId: b.pauses[0].requestId });
  await b.send("Fetch.disable");
  assert.equal(await b.evaluate("window.pendingRefresh"), false);
  assert.equal(await a.evaluate("window.pendingLogout"), true);
  mark("delayed real refresh response after logout intent cannot restore credentials; logout runs after cookie response");
  await until(async () => !(await b.evaluate("audit.snapshot().authenticated")) && !(await c.evaluate("audit.snapshot().authenticated")), "cross-tab logout");
  await reload(b, false);
  mark("logout clears all three tabs and F5 stays anonymous");
  assert.equal(await a.evaluate(`audit.login(${JSON.stringify(email)})`), true);
  await a.send("Network.emulateNetworkConditions", { offline: true, latency: 0, downloadThroughput: 0, uploadThroughput: 0 });
  assert.equal(await a.evaluate("audit.logout()"), false);
  assert.equal(await a.evaluate("!audit.snapshot().authenticated && JSON.parse(localStorage.getItem('learning-platform.logout')).pending"), true);
  await a.send("Network.emulateNetworkConditions", { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
  // CDP network emulation is not guaranteed to emit an online event in every Chrome version.
  await a.evaluate("window.dispatchEvent(new Event('online')); true");
  await until(() => a.evaluate("JSON.parse(localStorage.getItem('learning-platform.logout')).pending === false"), "online logout retry");
  mark("real offline transport failure returns false, immediately clears memory and retries logout on online event");
  const version = await (await fetch(`http://127.0.0.1:${chrome.port}/json/version`)).json();
  console.log("Browser:", version.Browser);
  const browser = await connect(version.webSocketDebuggerUrl);
  await Promise.race([browser.send("Browser.close"), sleep(1000)]);
  await until(() => chrome.process.exitCode !== null, "Chrome shutdown");
  chrome = await startChrome();
  const reopened = await tab(chrome.port);
  assert.equal(await reopened.evaluate("audit.snapshot().authenticated"), false);
  assert.equal(reopened.events.filter(e => e.url.endsWith("/api/auth/refresh")).length, 0);
  mark("closing and reopening Chrome with same isolated profile after logout stays anonymous");
} finally {
  connections.forEach(connection => connection.close());
  for (const child of children.reverse()) if (child.exitCode === null) child.kill();
  await writeFile(resolve(artifacts, "browser-summary.txt"), evidence.join("\n") + "\n", "utf8");
}
