"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorModel = exports.NSP = void 0;
var NSP;
(function (NSP) {
    NSP["hasNotChanged"] = "hasNotChanged";
    NSP["moduleNotExists"] = "moduleNotExists";
    NSP["deviceNotExists"] = "deviceNotExists";
    NSP["deviceNotOnline"] = "deviceNotOnline";
})(NSP = exports.NSP || (exports.NSP = {}));
class ErrorModel {
    constructor() {
        this.error = "ErrorModel";
        this.validates = [];
    }
}
exports.ErrorModel = ErrorModel;
//# sourceMappingURL=error.model.js.map