import * as jwt from 'jsonwebtoken'
import * as path from 'path'
import * as fs from 'fs'
import { isUndefined } from 'util'

export class CertSecurity {
    private platform: string
    private certPrivate: Buffer
    private certPublic: Buffer
    private payloadConfig: Object

    constructor(platform: string) {
        this.platform = platform

        if (platform !== 'app' && platform !== "esp")
            throw new Error(`Platform ${platform} not support`)

        this.certPrivate   = fs.readFileSync(this.resolveAssetsPath('private.key'))
        this.certPublic    = fs.readFileSync(this.resolveAssetsPath('public.key'))
        this.payloadConfig = require(this.resolveAssetsPath('payload.json'))
    }

    token(): string {
        return jwt.sign(this.payloadConfig, this.certPrivate, { algorithm: "RS256" })
    }

    verify(token, handle) {
        jwt.verify(token, this.certPublic, (err, decoded) => {
            if (!err) {
                const keyPayloads = Object.keys(this.payloadConfig)

                for (let i = 0; i < keyPayloads.length; ++i) {
                    const key   = keyPayloads[i]
                    const value = this.payloadConfig[key]

                    if (isUndefined(decoded[key]) || decoded[key] !== value)
                        return handle(err, false)
                }

                return handle(err, true)
            }

            return handle(err, false)
        })
    }

    private resolveAssetsPath(filename: string): string {
        return path.join(__dirname, '..', '..', 'assets/cert', this.platform, filename)
    }
}
