import { ValidateCheck } from "./util/validate/check.validate"
import { isUndefined, isString } from "util"
import { ErrorModel } from "./error.model"
import { Validate } from "./util/validate.util"

type processHandle = () => any
type preUpdateHandle = (object?: any) => any
type updateHandle = (object?: any) => any

export class MiddlewareModel {
    private errorModel: ErrorModel = new ErrorModel()
    private validator: Validate = new Validate()
    private process: Array<processHandle> = []
    private updates: Array<updateHandle> = []
    private preUpdater: preUpdateHandle

    preProcessed(...process: Array<processHandle>): MiddlewareModel {
        this.process = process
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

    run(object: any): MiddlewareModel {
        for (let i = 0; i < this.process.length; ++i) {
            const ps = this.process[i]
            const rs = ps()

            if (!isUndefined(rs) && isString(rs)) {
                this.errorModel.nsp = rs
                return this
            }
        }

        this.errorModel.validates = this.validator.execute(object)

        if (this.errorModel.validates.length <= 0) {
            if (!isUndefined(this.preUpdater)) {
                const pre = this.preUpdater(object)

                if (!isUndefined(pre) && isString(pre)) {
                    this.errorModel.nsp = pre
                    return this
                }
            }

            for (let i = 0; i < this.updates.length; ++i) {
                const up = this.updates[i]
                const rs = up(object)

                if (!isUndefined(rs) && isString(rs)) {
                    this.errorModel.nsp = rs
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
