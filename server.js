const http = require("http");

let state = {
  scoreA: 0, scoreB: 0,
  setsA: 0, setsB: 0,
  setHistory: [],
  gameOver: false, winner: null,
};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };
}

const server = http.createServer((req, res) => {
  const headers = corsHeaders(req.headers.origin || "");

  if (req.method === "OPTIONS") {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method === "GET" && req.url.startsWith("/state")) {
    res.writeHead(200, headers);
    res.end(JSON.stringify(state));
    return;
  }

  if (req.method === "PUT" && req.url === "/state") {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try {
        state = JSON.parse(body);
        res.writeHead(200, headers);
        res.end(JSON.stringify({ ok: true }));
      } catch {
        res.writeHead(400, headers);
        res.end(JSON.stringify({ error: "Invalid JSON" }));
      }
    });
    return;
  }

  if (req.method === "GET" && req.url === "/") {
    res.writeHead(200, headers);
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  res.writeHead(404, headers);
  res.end(JSON.stringify({ error: "Not found" }));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
