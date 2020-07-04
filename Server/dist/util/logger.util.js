"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = void 0;
var util_1 = require("util");
var cli_color_1 = require("cli-color");
var path = require("path");
var os = require("os");
var AppLogger = /** @class */ (function () {
    function AppLogger() {
    }
    AppLogger.prototype.log = function (message) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        process.stdout.write(cli_color_1.yellow("[" + params[0] + "] "));
        if (typeof message !== "object" && typeof message !== "function")
            process.stdout.write(cli_color_1.green(this.format(message) + "\n"));
        else
            process.stdout.write(cli_color_1.blue(this.format(message) + "\n"));
    };
    AppLogger.prototype.error = function (message, trace) {
        var params = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            params[_i - 2] = arguments[_i];
        }
        process.stderr.write(cli_color_1.yellow("[" + params[0] + "] "));
        process.stderr.write(cli_color_1.red(this.format(message) + "\n"));
        process.stderr.write(cli_color_1.red(trace + "\n"));
    };
    AppLogger.prototype.warn = function (message) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        process.stderr.write(cli_color_1.yellow("[" + params[0] + "] "));
        process.stderr.write(cli_color_1.yellow(this.format(message) + "\n"));
    };
    AppLogger.prototype.debug = function (message) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        process.stderr.write(cli_color_1.yellow("[" + params[0] + "] "));
        process.stderr.write(cli_color_1.blue(this.format(message) + "\n"));
    };
    AppLogger.prototype.verbose = function (message) {
        var params = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            params[_i - 1] = arguments[_i];
        }
        process.stderr.write(cli_color_1.yellow("[" + params[0] + "] "));
        process.stderr.write(cli_color_1.blackBright(this.format(message) + "\n"));
    };
    AppLogger.prototype.format = function (f) {
        if (!util_1.isString(f)) {
            var objects = [];
            for (var i_1 = 0; i_1 < arguments.length; i_1++)
                objects.push(util_1.inspect(arguments[i_1]));
            return objects.join(" ");
        }
        var i = 1;
        var args = arguments;
        var len = args.length;
        var str = String(f).replace(/%[sdj%]/g, function (x) {
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
        for (var x = args[i]; i < len; x = args[++i]) {
            if (util_1.isNull(x) || !util_1.isObject(x))
                str += " " + x;
            else
                str += " " + util_1.inspect(x);
        }
        return str;
    };
    AppLogger.prototype.icon = function (name) {
        var file = path.join(__dirname, "..", "assets/icon/" + name);
        if (os.release().indexOf("Microsoft")) {
            file = file.replace(/^\/mnt\/(\w+)\/(.+?)$/g, function (x, disk, path) {
                return disk + ":/" + path;
            });
        }
        return file;
    };
    return AppLogger;
}());
exports.AppLogger = AppLogger;
//# sourceMappingURL=logger.util.js.map