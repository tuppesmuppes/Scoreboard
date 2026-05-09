const http = require("http");
const https = require("https");

const SUPABASE_URL = "https://pgftkscaubdqprdvwvmt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnZnRrc2NhdWJkcXByZHZ3dm10Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMjcyODAsImV4cCI6MjA5MzkwMzI4MH0.pvUMfEMCxwKjBDc3yJ4pG2wcgdElmcjxWeAzMlMxYzU";

let scoreState = {
  scoreA: 0, scoreB: 0, setsA: 0, setsB: 0,
  setHistory: [], gameOver: false, winner: null,
};

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

function readBody(req) {
  return new Promise((res, rej) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => { try { res(JSON.parse(body)); } catch { rej(new Error("Invalid JSON")); } });
  });
}

function supabaseRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates",
      },
    };
    const req = https.request(options, res => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch { resolve(data); } });
    });
    req.on("error", reject);
    if (body !== undefined) req.write(JSON.stringify(body));
    req.end();
  });
}

async function getLib(key) {
  try {
    const result = await supabaseRequest("GET", `/rest/v1/lib?key=eq.${key}&select=data`, undefined);
    if (Array.isArray(result) && result.length > 0) return result[0].data;
    return [];
  } catch (e) { console.error("getLib error:", e); return []; }
}

async function setLib(key, data) {
  try {
    await supabaseRequest("POST", "/rest/v1/lib", { key, data });
  } catch (e) { console.error("setLib error:", e); }
}

const server = http.createServer(async (req, res) => {
  const headers = corsHeaders();

  if (req.method === "OPTIONS") { res.writeHead(204, headers); res.end(); return; }

  if (req.method === "GET" && req.url.startsWith("/state")) {
    res.writeHead(200, headers); res.end(JSON.stringify(scoreState)); return;
  }
  if (req.method === "PUT" && req.url === "/state") {
    try { scoreState = await readBody(req); res.writeHead(200, headers); res.end(JSON.stringify({ ok: true })); }
    catch { res.writeHead(400, headers); res.end(JSON.stringify({ error: "Invalid JSON" })); }
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/lib/annahme")) {
    const data = await getLib("annahme");
    res.writeHead(200, headers); res.end(JSON.stringify(data)); return;
  }
  if (req.method === "PUT" && req.url === "/lib/annahme") {
    try { await setLib("annahme", await readBody(req)); res.writeHead(200, headers); res.end(JSON.stringify({ ok: true })); }
    catch { res.writeHead(400, headers); res.end(JSON.stringify({ error: "Invalid JSON" })); }
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/lib/grund")) {
    const data = await getLib("grund");
    res.writeHead(200, headers); res.end(JSON.stringify(data)); return;
  }
  if (req.method === "PUT" && req.url === "/lib/grund") {
    try { await setLib("grund", await readBody(req)); res.writeHead(200, headers); res.end(JSON.stringify({ ok: true })); }
    catch { res.writeHead(400, headers); res.end(JSON.stringify({ error: "Invalid JSON" })); }
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, headers); res.end(JSON.stringify({ status: "ok" })); return;
  }

  res.writeHead(404, headers); res.end(JSON.stringify({ error: "Not found" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
