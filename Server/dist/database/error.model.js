"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorModel = exports.NSP = void 0;
var NSP;
(function (NSP) {
    NSP["hasNotChanged"] = "hasNotChanged";
    NSP["deviceNotExists"] = "deviceNotExists";
    NSP["deviceNotOnline"] = "deviceNotOnline";
})(NSP = exports.NSP || (exports.NSP = {}));
var ErrorModel = (function () {
    function ErrorModel() {
        this.error = "ErrorModel";
        this.validates = [];
    }
    return ErrorModel;
}());
exports.ErrorModel = ErrorModel;
//# sourceMappingURL=error.model.js.map