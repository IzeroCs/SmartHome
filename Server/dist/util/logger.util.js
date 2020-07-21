"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = void 0;
const util_1 = require("util");
const cli_color_1 = require("cli-color");
const path = require("path");
const os = require("os");
class AppLogger {
    log(message, ...params) {
        process.stdout.write(cli_color_1.yellow(`[${params[0]}] `));
        if (typeof message !== "object" && typeof message !== "function")
            process.stdout.write(cli_color_1.green(`${this.format(message)}\n`));
        else
            process.stdout.write(cli_color_1.blue(`${this.format(message)}\n`));
    }
    error(message, trace, ...params) {
        process.stderr.write(cli_color_1.yellow(`[${params[0]}] `));
        process.stderr.write(cli_color_1.red(`${this.format(message)}\n`));
        process.stderr.write(cli_color_1.red(trace + "\n"));
    }
    warn(message, ...params) {
        process.stderr.write(cli_color_1.yellow(`[${params[0]}] `));
        process.stderr.write(cli_color_1.yellow(`${this.format(message)}\n`));
    }
    debug(message, ...params) {
        process.stderr.write(cli_color_1.yellow(`[${params[0]}] `));
        process.stderr.write(cli_color_1.blue(`${this.format(message)}\n`));
    }
    verbose(message, ...params) {
        process.stderr.write(cli_color_1.yellow(`[${params[0]}] `));
        process.stderr.write(cli_color_1.blackBright(`${this.format(message)}\n`));
    }
    format(f) {
        if (!util_1.isString(f)) {
            let objects = [];
            for (let i = 0; i < arguments.length; i++)
                objects.push(util_1.inspect(arguments[i]));
            return objects.join(" ");
        }
        let i = 1;
        let args = arguments;
        let len = args.length;
        let str = String(f).replace(/%[sdj%]/g, (x) => {
            if (x === "%%")
                return "%";
            if (i >= len)
                return x;
            switch (x) {
                case "%s":
                    return String(args[i++]);
                case "%d":
                    return Number(args[i++]);
                case "%j":
                    try {
                        return JSON.stringify(args[i++]);
                    }
                    catch (_) {
                        return "[Circular]";
                    }
                default:
                    return x;
            }
        });
        for (let x = args[i]; i < len; x = args[++i]) {
            if (util_1.isNull(x) || !util_1.isObject(x))
                str += " " + x;
            else
                str += " " + util_1.inspect(x);
        }
        return str;
    }
    icon(name) {
        let file = path.join(__dirname, "..", "assets/icon/" + name);
        if (os.release().indexOf("Microsoft")) {
            file = file.replace(/^\/mnt\/(\w+)\/(.+?)$/g, (x, disk, path) => {
                return `${disk}:/${path}`;
            });
        }
        return file;
    }
}
exports.AppLogger = AppLogger;
//# sourceMappingURL=logger.util.js.map