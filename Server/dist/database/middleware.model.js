"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MiddlewareModel = void 0;
const util_1 = require("util");
const error_model_1 = require("./error.model");
const validate_util_1 = require("./util/validate.util");
class MiddlewareModel {
    constructor() {
        this.errorModel = new error_model_1.ErrorModel();
        this.validator = new validate_util_1.Validate();
        this.updates = [];
    }
    preProcessed(handle) {
        this.preProcess = handle;
        return this;
    }
    validate(...checks) {
        this.validator.addAll(checks);
        return this;
    }
    preUpdate(handle) {
        this.preUpdater = handle;
        return this;
    }
    update(...updates) {
        this.updates = updates;
        return this;
    }
    run(object) {
        if (!util_1.isUndefined(this.preProcessed)) {
            const ps = this.preProcess();
            if (!util_1.isUndefined(ps) && !util_1.isUndefined(error_model_1.NSP[ps])) {
                this.errorModel.nsp = ps;
                return this;
            }
        }
        this.errorModel.validates = this.validator.execute(object);
        if (this.errorModel.validates.length <= 0) {
            if (!util_1.isUndefined(this.preUpdater)) {
                const pre = this.preUpdater(object);
                if (!util_1.isUndefined(pre) && !util_1.isUndefined(error_model_1.NSP[pre])) {
                    this.errorModel.nsp = pre;
                    return this;
                }
            }
            for (let i = 0; i < this.updates.length; ++i) {
                const up = this.updates[i];
                const rs = up(object);
                if (!util_1.isUndefined(rs) && !util_1.isUndefined(error_model_1.NSP[rs])) {
                    this.errorModel.nsp = rs;
                    return this;
                }
            }
        }
        return this;
    }
    response(handle) {
        if (!util_1.isUndefined(this.errorModel.nsp) && util_1.isString(this.errorModel.nsp))
            return handle(this.errorModel);
        if (this.errorModel.validates.length > 0)
            return handle(this.errorModel);
        return handle();
    }
}
exports.MiddlewareModel = MiddlewareModel;
//# sourceMappingURL=middleware.model.js.map