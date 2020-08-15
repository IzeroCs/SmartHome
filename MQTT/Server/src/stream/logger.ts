import { isObject, isUndefined, isString, inspect, isNull, isFunction, isArray } from "util"
import { yellow, green, blue, red, blackBright } from "cli-color"

export class Logger {
    private context: string

    constructor(classes: any) {
        if (isObject(classes) && !isUndefined(classes.constructor)) this.context = classes.constructor.name
        else if (isFunction(classes)) this.context = classes.name
        else if (isString(classes)) this.context = classes
    }

    log(message?: any, ...params: any[]) {
        process.stdout.write(yellow(`[${this.context}] `))

        if (typeof message !== "object" && typeof message !== "function")
            process.stdout.write(green(`${this.format(message)}${this.formatParams(params)}\n`))
        else process.stdout.write(blue(`${this.format(message)}${this.formatParams(params)}\n`))
    }

    error(message?: any, trace?: string, ...params: any[]) {
        process.stderr.write(yellow(`[${this.context}] `))

        if (params) process.stderr.write(red(`${this.format(message)}${this.formatParams(params)}\n`))
        else process.stderr.write(red(`${this.format(message)}\n`))

        if (trace) process.stderr.write(red(trace + "\n"))
    }

    warn(message?: any, ...params: any[]) {
        process.stderr.write(yellow(`[${this.context}] `))
        process.stderr.write(yellow(`${this.format(message)}${this.formatParams(params)}\n`))
    }

    debug(message?: any, ...params: any[]) {
        process.stderr.write(yellow(`[${this.context}] `))
        process.stderr.write(blue(`${this.format(message)}${this.formatParams(params)}\n`))
    }

    verbose(message?: any, ...params: any[]) {
        process.stderr.write(yellow(`[${this.context}] `))
        process.stderr.write(blackBright(`${this.format(message)}${this.formatParams(params)}\n`))
    }

    private formatParams(params: any): string {
        let buffer: String = " "

        if (isUndefined(params) || !isArray(params) || params.length <= 0) {
            buffer = ""
        } else {
            for (let i = 0; i < params.length; ++i) buffer += this.format(params[i])
        }

        return buffer.toString()
    }

    private format(f: any) {
        if (!isString(f)) {
            let objects = []

            for (let i = 0; i < arguments.length; i++) objects.push(inspect(arguments[i]))

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
}
