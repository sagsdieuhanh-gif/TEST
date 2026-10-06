const fs=require('node:fs'),assert=require('node:assert/strict');
const html=fs.readFileSync(__dirname+'/../index.html','utf8');
assert.match(html,/id="sagsTestDeployment"/,'TEST deployment marker missing');
assert.match(html,/__SAGS_TEST_DEPLOYMENT=true/,'TEST deployment flag missing');
assert.doesNotMatch(html,/location\.replace\([^\n]*e-report-sags\.vercel\.app/,'TEST must never redirect to production');
console.log('TEST Pages isolation passed: no production redirect');
