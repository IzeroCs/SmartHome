import { LoggerService } from "@nestjs/common"
import { isString, inspect, isNull, isObject } from "util"
import { red, blue, green, yellow, blackBright } from "cli-color"
import * as notifier from "node-notifier"
import * as path from "path"
import * as os from "os"

export class AppLogger implements LoggerService {
    log(message?: any, ...params: any[]) {
        process.stdout.write(yellow(`[${params[0]}] `))

        if (typeof message !== "object" && typeof message !== "function")
            process.stdout.write(green(`${this.format(message)}\n`))
        else process.stdout.write(blue(`${this.format(message)}\n`))
    }

    error(message?: any, trace?: string, ...params: any[]) {
        notifier.notify({
            title: "Error: [" + params[0] + "]",
            subtitle: undefined,
            message: message,
            icon: this.icon("error.png"),
            sound: true,
            wait: false,
            timeout: 2000,
            type: "error",
        })

        process.stderr.write(yellow(`[${params[0]}] `))
        process.stderr.write(red(`${this.format(message)}\n`))
        process.stderr.write(red(trace + "\n"))
    }

    warn(message?: any, ...params: any) {
        notifier.notify({
            title: "Warning: [" + params[0] + "]",
            subtitle: undefined,
            message: message,
            icon: this.icon("warning.png"),
            sound: true,
            wait: false,
            timeout: 2000,
            type: "warn",
        })

        process.stderr.write(yellow(`[${params[0]}] `))
        process.stderr.write(yellow(`${this.format(message)}\n`))
    }

    debug(message?: any, ...params: any) {
        process.stderr.write(yellow(`[${params[0]}] `))
        process.stderr.write(blue(`${this.format(message)}\n`))
    }

    verbose(message?: any, ...params: any) {
        process.stderr.write(yellow(`[${params[0]}] `))
        process.stderr.write(blackBright(`${this.format(message)}\n`))
    }

    format(f: any) {
        if (!isString(f)) {
            let objects = []

            for (let i = 0; i < arguments.length; i++)
                objects.push(inspect(arguments[i]))

            return objects.join(" ")
        }

        let i = 1
        let args = arguments
        let len = args.length
        let str = String(f).replace(/%[sdj%]/g, (x: string): any => {
            if (x === "%%") return "%"
            if (i >= len) return x

            switch (x) {
                case "%s":
                    return String(args[i++])
                case "%d":
                    return Number(args[i++])
                case "%j":
                    try {
                        return JSON.stringify(args[i++])
                    } catch (_) {
                        return "[Circular]"
                    }
                default:
                    return x
            }
        })

        for (let x = args[i]; i < len; x = args[++i]) {
            if (isNull(x) || !isObject(x)) str += " " + x
            else str += " " + inspect(x)
        }

        return str
    }

    icon(name: string): string {
        let file = path.join(__dirname, "..", "assets/icon/" + name)

        if (os.release().indexOf("Microsoft")) {
            file = file.replace(
                /^\/mnt\/(\w+)\/(.+?)$/g,
                (x: string, disk: string, path: string): any => {
                    return `${disk}:/${path}`
                },
            )
        }

        return file
    }
}
