const http = require("http");

function options(path, origin) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "localhost", port: 4000, path, method: "OPTIONS",
      headers: {
        "Origin": origin,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type,Authorization",
      },
    };
    const req = http.request(opts, (res) => {
      resolve({ status: res.statusCode, headers: res.headers });
    });
    req.on("error", reject);
    req.end();
  });
}

function assert(label, condition, detail) {
  if (condition) console.log("  ✅ " + label);
  else { console.error("  ❌ FAIL: " + label + (detail ? " — " + detail : "")); process.exitCode = 1; }
}

async function run() {
  console.log("=== CORS Preflight Test ===\n");

  const origins = [
    "http://localhost:3000",
    "https://veda-ai-assessment-pearl.vercel.app",
  ];

  const paths = [
    "/api/auth/register",
    "/api/auth/login",
    "/api/assignments",
  ];

  for (const origin of origins) {
    console.log("Origin: " + origin);
    for (const path of paths) {
      const res = await options(path, origin);
      const acao = res.headers["access-control-allow-origin"];
      const acam = res.headers["access-control-allow-methods"];
      const acac = res.headers["access-control-allow-credentials"];
      assert(
        `OPTIONS ${path} → 204, origin allowed`,
        res.status === 204 && acao === origin,
        `status=${res.status} origin=${acao}`
      );
      assert(
        `  POST method allowed`,
        acam && acam.includes("POST"),
        acam
      );
      assert(
        `  credentials allowed`,
        acac === "true",
        acac
      );
    }
    console.log();
  }

  // Blocked origin
  console.log("Origin: https://evil.com (should be blocked)");
  const blocked = await options("/api/assignments", "https://evil.com");
  const blockedOrigin = blocked.headers["access-control-allow-origin"];
  assert(
    "Unlisted origin is NOT reflected",
    blockedOrigin !== "https://evil.com",
    "got: " + blockedOrigin
  );

  console.log("\n=== CORS Test Complete ===");
  if (!process.exitCode) console.log("✅ All CORS preflight tests passed");
}

run().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
