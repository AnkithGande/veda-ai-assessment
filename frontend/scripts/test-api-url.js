function normaliseApiUrl(url) {
  const stripped = url.replace(/\/+$/, "");
  if (stripped.endsWith("/api")) return stripped;
  return stripped + "/api";
}

const cases = [
  ["https://veda-ai-assessment-2zm7.onrender.com",      "https://veda-ai-assessment-2zm7.onrender.com/api"],
  ["https://veda-ai-assessment-2zm7.onrender.com/",     "https://veda-ai-assessment-2zm7.onrender.com/api"],
  ["https://veda-ai-assessment-2zm7.onrender.com/api",  "https://veda-ai-assessment-2zm7.onrender.com/api"],
  ["https://veda-ai-assessment-2zm7.onrender.com/api/", "https://veda-ai-assessment-2zm7.onrender.com/api"],
  ["http://localhost:4000/api",                         "http://localhost:4000/api"],
  ["http://localhost:4000",                             "http://localhost:4000/api"],
  ["http://localhost:4000/",                            "http://localhost:4000/api"],
];

let allPass = true;
cases.forEach(function(pair) {
  const input = pair[0];
  const expected = pair[1];
  const result = normaliseApiUrl(input);
  const pass = result === expected;
  if (!pass) allPass = false;
  console.log((pass ? "OK" : "FAIL") + "  " + input + "  =>  " + result);
});
console.log(allPass ? "\nAll normalisation cases pass" : "\nSome cases FAILED");
process.exit(allPass ? 0 : 1);
