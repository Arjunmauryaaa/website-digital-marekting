// Local stand-in for the Resend API, used only by end-to-end tests.
// POST /emails stores the message; GET /last returns it; ?fail makes the next call return 500.
import http from "node:http";
let last = null;
let failNext = false;
http
  .createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (req.method === "GET" && url.pathname === "/last") {
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify(last));
    }
    if (req.method === "POST" && url.pathname === "/fail-next") {
      failNext = true;
      res.writeHead(204);
      return res.end();
    }
    if (req.method === "POST" && url.pathname === "/emails") {
      let body = "";
      req.on("data", (c) => (body += c));
      req.on("end", () => {
        if (failNext) {
          failNext = false;
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end('{"message":"boom"}');
        }
        last = { auth: req.headers.authorization, body: JSON.parse(body || "{}") };
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end('{"id":"mock"}');
      });
      return;
    }
    res.writeHead(404);
    res.end();
  })
  .listen(4020, () => console.log("mock resend on 4020"));
