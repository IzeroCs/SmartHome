import { ValidateCheck } from "./util/validate/check.validate"
import { isUndefined, isString } from "util"
import { ErrorModel, NSP } from "./error.model"
import { Validate } from "./util/validate.util"

type preProcessHandle = () => any
type preUpdateHandle = (object?: any) => any
type updateHandle = (object?: any) => any

export class MiddlewareModel {
    private errorModel: ErrorModel = new ErrorModel()
    private validator: Validate = new Validate()
    private preProcess: preProcessHandle
    private updates: Array<updateHandle> = []
    private preUpdater: preUpdateHandle

    preProcessed(handle: preProcessHandle): MiddlewareModel {
        this.preProcess = handle
        return this
    }

    validate(...checks: ValidateCheck[]): MiddlewareModel {
        this.validator.addAll(checks)
        return this
    }

    preUpdate(handle: preUpdateHandle): MiddlewareModel {
        this.preUpdater = handle
        return this
    }

    update(...updates: Array<updateHandle>): MiddlewareModel {
        this.updates = updates
        return this
    }

    run(object?: any): MiddlewareModel {
        if (!isUndefined(this.preProcessed)) {
            const ps = this.preProcess()

            if (!isUndefined(ps) && !isUndefined(NSP[ps])) {
                this.errorModel.nsp = <NSP>ps
                return this
            }
        }

        this.errorModel.validates = this.validator.execute(object)

        if (this.errorModel.validates.length <= 0) {
            if (!isUndefined(this.preUpdater)) {
                const pre = this.preUpdater(object)

                if (!isUndefined(pre) && !isUndefined(NSP[pre])) {
                    this.errorModel.nsp = <NSP>pre
                    return this
                }
            }

            for (let i = 0; i < this.updates.length; ++i) {
                const up = this.updates[i]
                const rs = up(object)

                if (!isUndefined(rs) && !isUndefined(NSP[rs])) {
                    this.errorModel.nsp = <NSP>rs
                    return this
                }
            }
        }

        return this
    }

    response(handle: (error?: ErrorModel) => any) {
        if (!isUndefined(this.errorModel.nsp) && isString(this.errorModel.nsp)) return handle(this.errorModel)
        if (this.errorModel.validates.length > 0) return handle(this.errorModel)

        return handle()
    }
}
