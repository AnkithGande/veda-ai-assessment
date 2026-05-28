/**
 * Starts dist/index.js on port 4001, hits /api/health, then exits.
 */
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");

require("dotenv").config();

const server = spawn(process.execPath, [path.join(__dirname, "../dist/index.js")], {
  env: { ...process.env, PORT: "4001" },
  stdio: ["ignore", "pipe", "pipe"],
});

let started = false;
let output = "";

server.stdout.on("data", (d) => {
  output += d.toString();
  if (!started && output.includes("Server running")) {
    started = true;
    // Hit health endpoint
    setTimeout(() => {
      http.get("http://localhost:4001/api/health", (res) => {
        let body = "";
        res.on("data", (c) => body += c);
        res.on("end", () => {
          const j = JSON.parse(body);
          console.log("dist/index.js health check:", j.success ? "✅ PASS" : "❌ FAIL");
          console.log("Message:", j.message);
          server.kill();
          process.exit(j.success ? 0 : 1);
        });
      }).on("error", (e) => {
        console.error("❌ HTTP error:", e.message);
        server.kill();
        process.exit(1);
      });
    }, 500);
  }
});

server.stderr.on("data", (d) => process.stderr.write(d));

server.on("exit", (code) => {
  if (!started) {
    console.error("❌ Server exited before starting. Output:\n" + output);
    process.exit(1);
  }
});

// Hard timeout
setTimeout(() => {
  console.error("❌ Timeout — server did not start in 15s");
  server.kill();
  process.exit(1);
}, 15000);
