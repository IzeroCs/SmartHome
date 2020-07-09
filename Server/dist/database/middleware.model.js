"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareModel = void 0;
var util_1 = require("util");
var error_model_1 = require("./error.model");
var validate_util_1 = require("./util/validate.util");
var MiddlewareModel = (function () {
    function MiddlewareModel() {
        this.errorModel = new error_model_1.ErrorModel();
        this.validator = new validate_util_1.Validate();
        this.updates = [];
    }
    MiddlewareModel.prototype.preProcessed = function (handle) {
        this.preProcess = handle;
        return this;
    };
    MiddlewareModel.prototype.validate = function () {
        var checks = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            checks[_i] = arguments[_i];
        }
        this.validator.addAll(checks);
        return this;
    };
    MiddlewareModel.prototype.preUpdate = function (handle) {
        this.preUpdater = handle;
        return this;
    };
    MiddlewareModel.prototype.update = function () {
        var updates = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            updates[_i] = arguments[_i];
        }
        this.updates = updates;
        return this;
    };
    MiddlewareModel.prototype.run = function (object) {
        if (!util_1.isUndefined(this.preProcessed)) {
            var ps = this.preProcess();
            if (!util_1.isUndefined(ps) && !util_1.isUndefined(error_model_1.NSP[ps])) {
                this.errorModel.nsp = ps;
                return this;
            }
        }
        this.errorModel.validates = this.validator.execute(object);
        if (this.errorModel.validates.length <= 0) {
            if (!util_1.isUndefined(this.preUpdater)) {
                var pre = this.preUpdater(object);
                if (!util_1.isUndefined(pre) && !util_1.isUndefined(error_model_1.NSP[pre])) {
                    this.errorModel.nsp = pre;
                    return this;
                }
            }
            for (var i = 0; i < this.updates.length; ++i) {
                var up = this.updates[i];
                var rs = up(object);
                if (!util_1.isUndefined(rs) && !util_1.isUndefined(error_model_1.NSP[rs])) {
                    this.errorModel.nsp = rs;
                    return this;
                }
            }
        }
        return this;
    };
    MiddlewareModel.prototype.response = function (handle) {
        if (!util_1.isUndefined(this.errorModel.nsp) && util_1.isString(this.errorModel.nsp))
            return handle(this.errorModel);
        if (this.errorModel.validates.length > 0)
            return handle(this.errorModel);
        return handle();
    };
    return MiddlewareModel;
}());
exports.MiddlewareModel = MiddlewareModel;
//# sourceMappingURL=middleware.model.js.map