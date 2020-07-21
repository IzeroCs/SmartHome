"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertSecurity = void 0;
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const util_1 = require("util");
class CertSecurity {
    constructor(platform) {
        this.platform = platform;
        if (platform !== "app" && platform !== "esp")
            throw new Error(`Platform ${platform} not support`);
        this.certPrivate = fs.readFileSync(this.resolveAssetsPath("private.key"));
        this.certPublic = fs.readFileSync(this.resolveAssetsPath("public.key"));
        this.payloadConfig = require(this.resolveAssetsPath("payload.json"));
    }
    token() {
        return jwt.sign(this.payloadConfig, this.certPrivate, {
            algorithm: "RS256"
        });
    }
    verify(token, handle) {
        try {
            const decoded = jwt.verify(token, this.certPublic);
            const keyPayloads = Object.keys(this.payloadConfig);
            for (let i = 0; i < keyPayloads.length; ++i) {
                const key = keyPayloads[i];
                const value = this.payloadConfig[key];
                if (util_1.isUndefined(decoded[key]) || decoded[key] !== value)
                    return handle("Undefined decoded key", false);
            }
            return handle(null, true);
        }
        catch (err) {
            return handle(err, false);
        }
    }
    resolveAssetsPath(filename) {
        return path.join(__dirname, "..", "..", "assets/cert", this.platform, filename);
    }
}
exports.CertSecurity = CertSecurity;
//# sourceMappingURL=cert.security.js.map