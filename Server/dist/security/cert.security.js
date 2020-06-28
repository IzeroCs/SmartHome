"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CertSecurity = void 0;
var jwt = require("jsonwebtoken");
var path = require("path");
var fs = require("fs");
var util_1 = require("util");
var CertSecurity = /** @class */ (function () {
    function CertSecurity(platform) {
        this.platform = platform;
        if (platform !== 'app' && platform !== 'esp')
            throw new Error("Platform " + platform + " not support");
        this.certPrivate = fs.readFileSync(this.resolveAssetsPath('private.key'));
        this.certPublic = fs.readFileSync(this.resolveAssetsPath('public.key'));
        this.payloadConfig = require(this.resolveAssetsPath('payload.json'));
    }
    CertSecurity.prototype.token = function () {
        return jwt.sign(this.payloadConfig, this.certPrivate, {
            algorithm: 'RS256',
        });
    };
    CertSecurity.prototype.verify = function (token, handle) {
        var _this = this;
        jwt.verify(token, this.certPublic, function (err, decoded) {
            if (!err) {
                var keyPayloads = Object.keys(_this.payloadConfig);
                for (var i = 0; i < keyPayloads.length; ++i) {
                    var key = keyPayloads[i];
                    var value = _this.payloadConfig[key];
                    if (util_1.isUndefined(decoded[key]) || decoded[key] !== value)
                        return handle(err, false);
                }
                return handle(err, true);
            }
            return handle(err, false);
        });
    };
    CertSecurity.prototype.resolveAssetsPath = function (filename) {
        return path.join(__dirname, '..', '..', 'assets/cert', this.platform, filename);
    };
    return CertSecurity;
}());
exports.CertSecurity = CertSecurity;
//# sourceMappingURL=cert.security.js.map