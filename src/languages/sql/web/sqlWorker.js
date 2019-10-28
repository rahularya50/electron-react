import { join } from "path";
import execute, { init } from "./execution.js";

importScripts(join(__static, "./sql/sql.js"));

const launchText = `CS61A SQL Web Interpreter
--------------------------------------------------------------------------------
Welcome to the 61A SQL web interpreter!
Check out the code for this app on GitHub.

Type .help for instructions.
The tables used in homework, labs, and lecture are already available to use.
`;

function stdout(val) {
    postMessage({ out: true, val });
}

function visualize(visualization) {
    postMessage({ out: true, visualization });
}

export function stderr(val) {
    postMessage({ error: true, val });
}

export function exit(val) {
    postMessage({ exit: true, val });
}

let buff = "";

init();

onmessage = async (e) => {
    const { data } = e;
    const { input } = data;
    if (!input) {
        stdout(launchText);
    }
    buff += input;
    if (!input.trimEnd() || buff.trimEnd().endsWith(";") || input.startsWith(".")) {
        const ret = await execute(buff.trimEnd());
        const out = ret.visualization ? ret.out : ret;
        for (const elem of out) {
            stdout(elem);
            if (ret.visualization && elem === out[out.length - 1]) {
                visualize(ret.visualization);
            }
            stdout("\n");
        }
        buff = "";
    }
    if (buff) {
        stderr("...> ");
    } else {
        stderr("sql> ");
    }
};
