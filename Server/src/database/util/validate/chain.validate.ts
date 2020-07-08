import { ValidateChainInterface } from "./chain.interface.validate"
import { ValidateCheck } from "./check.validate"
import { isUndefined, isNumber, isString, isArray } from "util"
import validator from "validator"
import { ValidateChainResult } from "./chain.result.validate"

export class ValidateChain implements ValidateChainInterface {
    private object: any
    private find: any
    private field: string
    private check: ValidateCheck

    constructor(object: any, field: string, check: ValidateCheck) {
        this.object = object
        this.field = field
        this.check = check
        this.find = this.findFieldObject()

        if (typeof this.find === "object") this.find = undefined
    }

    run() {
        const chains = this.check.getChains()
        const chainKeys = chains.keys()
        const chainResult = this.getChainResult()

        for (let chain of Array.from(chainKeys)) {
            let options = chains.get(chain)
            let result = true
            let verify = true

            if (!isUndefined(this[chain])) {
                if (!isUndefined(options) && this[chain] instanceof Function) {
                    result = this[chain].apply(this, Object.values(options))
                } else {
                    result = this[chain](options)
                }
            } else if (this.check.hasCustom(chain)) {
                result = this.check.getCustomHandle(chain)(this.field, this.find)
                if (isUndefined(result)) continue
            } else {
                verify = false
            }

            if (verify) chainResult[chain] = result
            if (!result) break
        }
    }

    isRequired(): boolean {
        return !isUndefined(this.find)
    }

    isNotEmpty(): boolean {
        if (!this.isRequired() && !this.isString()) return false
        if (this.find === null || this.find.length <= 0) return false

        return true
    }

    isNumber(): boolean {
        if (!this.isRequired()) return false
        if (!isNumber(this.find) && typeof this.find !== "number") return false

        return true
    }

    isString(): boolean {
        if (!this.isRequired()) return false
        if (!isString(this.find) && typeof this.find !== "string") return false

        return true
    }

    isEmail(): boolean {
        if (!this.isString()) return false
        if (!validator.isEmail(this.find)) return false

        return true
    }

    isURL(): boolean {
        if (!this.isString()) return false
        if (!validator.isURL(this.find)) return false

        return true
    }

    isIn(array: any): boolean {
        if (!this.isString()) return false
        if (!isArray(array) && this.find !== array) return false
        if (isArray(array) && array.indexOf(this.find) === -1) return false

        return true
    }

    isMin(min: number): boolean {
        let res = true

        if (!this.isRequired() && !this.isString()) res = false
        if (this.find.length < min) res = false
        if (!res && !isUndefined(this.getChainResult().isLength)) this.getChainResult().isLength = false

        return res
    }

    isMax(max: number): boolean {
        let res = true

        if (!this.isRequired() && !this.isString()) res = false
        if (this.find.length > max) res = false
        if (!res && !isUndefined(this.getChainResult().isLength)) this.getChainResult().isLength = false

        return res
    }

    isLength(min: number, max: number): boolean {
        if (!this.isRequired() && !this.isString()) return false

        if (this.find.length < min) {
            if (!isUndefined(this.getChainResult().isMin)) this.getChainResult().isMin = false
            return false
        }

        if (this.find.length > max) {
            if (!isUndefined(this.getChainResult().isMax)) this.getChainResult().isMax = false
            return false
        }

        return true
    }

    custom() {}

    findFieldObject(): any | undefined {
        if (this.field.indexOf(".") !== -1) {
            let fields = this.field.split(".")
            let target = this.object

            for (let i = 0; i < fields.length; ++i) {
                let f = target[fields[i]]

                if (isUndefined(f)) return undefined
                else target = f
            }

            return target
        }

        if (isUndefined(this.object[this.field])) return undefined
        else return this.object[this.field]
    }

    private getChainResult(): ValidateChainResult {
        return this.check.getResults().get(this.field)
    }
}
