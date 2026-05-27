const http = require("http");

function apiRequest(method, path, callback) {
  const options = { hostname: "localhost", port: 4000, path: path, method: method };
  const req = http.request(options, function(res) {
    let body = "";
    res.on("data", function(chunk) { body += chunk; });
    res.on("end", function() {
      try { callback(null, res.statusCode, JSON.parse(body)); }
      catch(e) { callback(e); }
    });
  });
  req.on("error", callback);
  req.end();
}

// Step 1: find a PENDING assignment
apiRequest("GET", "/api/assignments?page=1&pageSize=10", function(err, status, body) {
  if (err) { console.error("List error:", err.message); process.exit(1); }

  var pending = null;
  for (var i = 0; i < body.data.length; i++) {
    if (body.data[i].status === "PENDING") { pending = body.data[i]; break; }
  }

  if (!pending) {
    console.log("No PENDING assignment found — checking COMPLETED ones");
    var completed = body.data.filter(function(a) { return a.status === "COMPLETED"; });
    console.log("COMPLETED assignments:", completed.length);
    if (completed.length > 0) {
      console.log("Paper test — fetching paper for:", completed[0].id);
      apiRequest("GET", "/api/assignments/" + completed[0].id, function(err2, s2, b2) {
        var a = b2.data;
        console.log("Status:", a.status);
        console.log("Paper exists:", !!a.generatedPaper);
        if (a.generatedPaper) {
          var c = a.generatedPaper.content;
          console.log("Sections:", c.sections.length, "| Questions:", c.totalQuestions, "| Marks:", c.totalMarks);
        }
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
    return;
  }

  console.log("Found PENDING:", pending.id);
  console.log("Title:", pending.title.substring(0, 50));

  // Step 2: trigger generation
  apiRequest("POST", "/api/assignments/" + pending.id + "/generate", function(err, status, body) {
    if (err) { console.error("Generate error:", err.message); process.exit(1); }
    console.log("Generate:", status, body.message);

    // Step 3: poll for completion
    var attempts = 0;
    var maxAttempts = 12;
    var pollInterval = setInterval(function() {
      apiRequest("GET", "/api/assignments/" + pending.id, function(err, status, body) {
        if (err) { console.error("Poll error:", err.message); return; }
        var a = body.data;
        attempts++;
        console.log("Poll " + attempts + ": " + a.status + (a.generatedPaper ? " | paper: YES" : " | paper: NO"));

        if (a.status === "COMPLETED" || a.status === "FAILED" || attempts >= maxAttempts) {
          clearInterval(pollInterval);
          console.log("\nFinal status:", a.status);
          console.log("Paper exists:", !!a.generatedPaper);
          if (a.generatedPaper) {
            var c = a.generatedPaper.content;
            console.log("Sections:", c.sections.length);
            console.log("Questions:", c.totalQuestions);
            console.log("Marks:", c.totalMarks);
            console.log("\nPIPELINE TEST PASSED");
          }
          process.exit(a.status === "COMPLETED" ? 0 : 1);
        }
      });
    }, 2000);
  });
});
