import {
    ERR, EXIT, INTERACT_PROCESS, KILL_PROCESS, OUT, REQUEST_KEY,
} from "../../common/communicationEnums.js";

let ipcRenderer;

// // eslint-disable-next-line
if (ELECTRON) {
    ({ ipcRenderer } = require("electron")); // TODO: RE-ENABLE!!!
}
const activeExecutions = {};

const dummy = () => null;

function interactProcess(key, line) {
    ipcRenderer.send("asynchronous-message", {
        type: INTERACT_PROCESS,
        key,
        line,
    });
}

let nextKey = 0;

function requestKey() {
    if (ELECTRON) {
        return ipcRenderer.sendSync("synchronous-message", REQUEST_KEY);
    } else {
        return ++nextKey;
    }
}

export function send(message, onOutput, onErr, onHalt) {
    console.log(message);

    const key = requestKey();

    if (ELECTRON) {
        ipcRenderer.send("asynchronous-message", { key, ...message });
    } else {
        // todo!
    }
    activeExecutions[key] = {
        onOutput: onOutput || dummy,
        onErr: onErr || dummy,
        onHalt: onHalt || dummy,
    };

    return [
        line => interactProcess(key, line),
        () => killProcess(key),
        () => detachHandlers(key),
    ];
}

export function sendNoInteract(message) {
    return new Promise((resolve, reject) => {
        let out = null;
        send(message, (val) => {
            if (out) {
                out += val;
            } else {
                out = val;
            }
        }, (arg) => {
            console.error(arg);
            reject(arg);
        }, () => resolve(out));
    });
}

function killProcess(key) {
    if (ELECTRON) {
        ipcRenderer.send("asynchronous-message", { key, type: KILL_PROCESS });
    } else {
        // TODO
    }
}

function detachHandlers(key) {
    if (activeExecutions[key]) {
        activeExecutions[key] = {
            onOutput: dummy,
            onErr: dummy,
            onHalt: dummy,
        };
    }
}

if (ELECTRON) {
    ipcRenderer.on("asynchronous-reply", (event, arg) => {
        if (arg.type === OUT) {
            activeExecutions[arg.key].onOutput(arg.out);
        } else if (arg.type === ERR) {
            activeExecutions[arg.key].onErr(arg.out);
        } else if (arg.type === EXIT) {
            if (!activeExecutions[arg.key]) {
                // key from previous window, is now dead :P
                return;
            }
            activeExecutions[arg.key].onHalt(arg.out);
            delete activeExecutions[arg.key];
        } else {
            console.log(arg);
        }
    });
}
