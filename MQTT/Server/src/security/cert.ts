import * as jwt from "jsonwebtoken"
import * as path from "path"
import * as fs from "fs"
import { isUndefined } from "util"

export class Cert {
    private platform: string
    private certPrivate: Buffer
    private certPublic: Buffer
    private payloadConfig: Object

    constructor(platform: string) {
        this.platform = platform.toLowerCase().replace("platform.", "")

        if (this.platform !== "app" && this.platform !== "esp") {
            throw new Error(`Platform ${this.platform} not support`)
        }

        this.certPrivate = fs.readFileSync(this.resolveAssetsPath("private.key"))
        this.certPublic = fs.readFileSync(this.resolveAssetsPath("public.key"))
        this.payloadConfig = require(this.resolveAssetsPath("payload.json"))
    }

    token(): string {
        return jwt.sign(this.payloadConfig, this.certPrivate, {
            algorithm: "RS256"
        })
    }

    verify(token, handle: (authorized: boolean, err: any) => any) {
        try {
            const decoded = jwt.verify(token, this.certPublic)
            const keyPayloads = Object.keys(this.payloadConfig)

            for (let i = 0; i < keyPayloads.length; ++i) {
                const key = keyPayloads[i]
                const value = this.payloadConfig[key]

                if (isUndefined(decoded[key]) || decoded[key] !== value) return handle(false, "Undefined decoded key")
            }

            return handle(true, null)
        } catch (err) {
            return handle(false, err)
        }
    }

    verifySync(token: string): boolean {
        try {
            const decoded = jwt.verify(token, this.certPublic)
            const keyPayloads = Object.keys(this.payloadConfig)

            for (let i = 0; i < keyPayloads.length; ++i) {
                const key = keyPayloads[i]
                const value = this.payloadConfig[key]

                if (isUndefined(decoded[key]) || decoded[key] !== value) return false
            }

            return true
        } catch (err) {
            return false
        }
    }

    private resolveAssetsPath(filename: string): string {
        return path.join(__dirname, "..", "..", "assets/cert", this.platform, filename)
    }
}
