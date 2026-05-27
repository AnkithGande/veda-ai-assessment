require("dotenv").config();
const http = require("http");

const BASE = "http://localhost:4000/api";
const TEST_EMAIL = "testuser_" + Date.now() + "@vedaai.com";
const TEST_PASSWORD = "testpass123";
const TEST_NAME = "Test User";

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const opts = {
      hostname: "localhost", port: 4000,
      path: "/api" + path, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data) }
    };
    const req = http.request(opts, (res) => {
      let raw = "";
      res.on("data", (c) => raw += c);
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: "localhost", port: 4000,
      path: "/api" + path, method: "GET",
      headers: token ? { Authorization: "Bearer " + token } : {}
    };
    const req = http.request(opts, (res) => {
      let raw = "";
      res.on("data", (c) => raw += c);
      res.on("end", () => resolve({ status: res.statusCode, body: JSON.parse(raw) }));
    });
    req.on("error", reject);
    req.end();
  });
}

function assert(label, condition, detail) {
  if (condition) {
    console.log("  ✅ " + label);
  } else {
    console.error("  ❌ FAIL: " + label + (detail ? " — " + detail : ""));
    process.exitCode = 1;
  }
}

async function run() {
  console.log("=== Auth Pipeline Test ===\n");

  // 1. Health check
  console.log("1. Health check");
  const health = await get("/health");
  assert("GET /api/health returns 200", health.status === 200);

  // 2. Register new user
  console.log("\n2. Register new user (" + TEST_EMAIL + ")");
  const reg = await post("/auth/register", {
    name: TEST_NAME, email: TEST_EMAIL,
    password: TEST_PASSWORD, confirmPassword: TEST_PASSWORD
  });
  assert("POST /auth/register returns 201", reg.status === 201, "got " + reg.status);
  assert("Response has token", typeof reg.body.data?.token === "string");
  assert("Response has user.id", typeof reg.body.data?.user?.id === "string");
  assert("Response has user.email", reg.body.data?.user?.email === TEST_EMAIL);
  const token = reg.body.data?.token;

  // 3. Duplicate email rejected
  console.log("\n3. Duplicate email rejected");
  const dup = await post("/auth/register", {
    name: TEST_NAME, email: TEST_EMAIL,
    password: TEST_PASSWORD, confirmPassword: TEST_PASSWORD
  });
  assert("Duplicate returns 409", dup.status === 409, "got " + dup.status);
  assert("Error message present", typeof dup.body.error === "string");

  // 4. Login with registered credentials
  console.log("\n4. Login with registered credentials");
  const login = await post("/auth/login", { email: TEST_EMAIL, password: TEST_PASSWORD });
  assert("POST /auth/login returns 200", login.status === 200, "got " + login.status);
  assert("Login returns token", typeof login.body.data?.token === "string");
  assert("Login returns user", login.body.data?.user?.email === TEST_EMAIL);
  const loginToken = login.body.data?.token;

  // 5. Wrong password rejected
  console.log("\n5. Wrong password rejected");
  const bad = await post("/auth/login", { email: TEST_EMAIL, password: "wrongpassword" });
  assert("Wrong password returns 401", bad.status === 401, "got " + bad.status);

  // 6. Wrong email rejected
  console.log("\n6. Non-existent email rejected");
  const noUser = await post("/auth/login", { email: "nobody@vedaai.com", password: TEST_PASSWORD });
  assert("Non-existent email returns 401", noUser.status === 401, "got " + noUser.status);

  // 7. GET /me with valid token
  console.log("\n7. GET /auth/me with valid token");
  const me = await get("/auth/me", loginToken);
  assert("GET /auth/me returns 200", me.status === 200, "got " + me.status);
  assert("Me returns correct email", me.body.data?.email === TEST_EMAIL);
  assert("Me returns name", me.body.data?.name === TEST_NAME);

  // 8. GET /me without token
  console.log("\n8. GET /auth/me without token");
  const noToken = await get("/auth/me");
  assert("No token returns 401", noToken.status === 401, "got " + noToken.status);

  // 9. Validation errors
  console.log("\n9. Validation errors");
  const shortPw = await post("/auth/register", {
    name: "X", email: "valid@test.com",
    password: "abc", confirmPassword: "abc"
  });
  assert("Short password returns 422", shortPw.status === 422, "got " + shortPw.status);

  const mismatch = await post("/auth/register", {
    name: "Test", email: "valid2@test.com",
    password: "password123", confirmPassword: "different"
  });
  assert("Password mismatch returns 422", mismatch.status === 422, "got " + mismatch.status);

  const badEmail = await post("/auth/register", {
    name: "Test", email: "notanemail",
    password: "password123", confirmPassword: "password123"
  });
  assert("Invalid email returns 422", badEmail.status === 422, "got " + badEmail.status);

  // 10. Assignments still work (existing flow not broken)
  console.log("\n10. Assignments API still works");
  const assignments = await get("/assignments?page=1&pageSize=5");
  assert("GET /assignments returns 200", assignments.status === 200, "got " + assignments.status);
  assert("Assignments response has data array", Array.isArray(assignments.body.data));

  console.log("\n=== Test Complete ===");
  if (process.exitCode === 1) {
    console.error("\n❌ Some tests failed");
  } else {
    console.log("\n✅ All auth tests passed");
  }
}

run().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
