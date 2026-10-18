# Check timings from the server log (Oct 18, local server, Sentry tracing on)

One JSON line per check, logged by src/server.ts. readMs = Gemma reading; countMs = the stitch.count span (pure arithmetic). trace = the Sentry trace id.

```
{"check":true,"trace":"c6e9a319811c7479c7931bde383d96db","lines":11,"sizes":1,"findings":0,"readMs":16749,"countMs":1.8,"calls":3,"cached":0,"inTok":3563,"outTok":804}
{"check":true,"trace":"f711ddc6a4c40d13c9bffd37b929dcd7","lines":13,"sizes":1,"findings":1,"readMs":17241,"countMs":1.5,"calls":3,"cached":0,"inTok":3693,"outTok":960}
{"check":true,"trace":"ea0dedebfe67623455de21822453461e","lines":20,"sizes":4,"findings":2,"readMs":22291,"countMs":1.8,"calls":3,"cached":0,"inTok":4253,"outTok":1421}
```
