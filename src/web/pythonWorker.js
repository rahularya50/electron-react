import { join } from "path";

import console from "./web_console.py";

importScripts(join(__static, "brython.js"));
importScripts(join(__static, "brython_stdlib.js"));

self.window = this;

onmessage = (e) => {
    const { data } = e;
    const { code } = data;
    runPyCode(code);
};

function runPyCode(code) {
    self.stdout = { write: postMessage };
    self.stderr = { write: postMessage };
    __BRYTHON__.brython();
    __BRYTHON__.run_script(console, '__main__', true)
}
