import { isUndefined, isArray, isString, isNumber } from "util"
import validator from "validator"

type fields = string | string[]
type chainOptions = { min?: number; max?: number; in?: any }
type chainHandle = (field: string, value: any) => any

export class Validate {
    private list: Array<ValidateCheck> = []

    constructor(checks?: ValidateCheck[]) {
        if (checks) checks.map(check => this.list.push(check))
    }

    check(fields?: fields, message?: any): ValidateCheck {
        const check = new ValidateCheck(fields, message)
        this.list.push(check)

        return check
    }

    execute(object: any): Promise<ValidateError[]> {
        return new Promise((resolve, reject) => {
            const errors = new Map<string, ValidateError>()

            for (let i = 0; i < this.list.length; ++i) {
                let check = this.list[i].run(object)
                let fields = check.getFields()
                let results = check.getResults()

                if (isArray(fields)) {
                    for (let f = 0; f < fields.length; ++f) {
                        let field = fields[f]
                        let result = results.get(field)

                        this.resultToError(field, result, errors)
                    }
                } else {
                    this.resultToError(fields, results.get(fields), errors)
                }
            }

            if (errors.size > 0) return reject(Array.from(errors.values()))
            else return resolve()
        })
    }

    private resultToError(field: string, result: ChainResult, errors: Map<string, ValidateError>) {
        let resultKeys = Object.keys(result)
        let errorValidate: ValidateError = null

        if (errors.has(field)) {
            errorValidate = errors.get(field)
        } else {
            errorValidate = new ValidateError(field)
            errors.set(field, errorValidate)
        }

        for (let i = 0; i < resultKeys.length; ++i) {
            let key = resultKeys[i]
            let value = result[key]

            if (typeof value !== "boolean" || value === false) errorValidate.push(key)
        }
    }
}

class ChainResult {
    isRequired?: boolean
    isNotEmpty?: boolean
    isNumber?: boolean
    isString?: boolean
    isEmail?: boolean
    isURL?: boolean
    isIn?: boolean
    isMin?: boolean
    isMax?: boolean
    isLength?: boolean
}

interface ValidateChainInterface {
    run(object?: any)
    isRequired()
    isNotEmpty()
    isNumber()
    isString()
    isEmail()
    isURL()
    isMin(min: number)
    isMax(max: number)
    isIn(array: any)
    isLength(min: number, max: number)
    custom(nsp?: string, handle?: chainHandle)
}

class ValidateError {
    private field: string = ""
    private chains: Array<string> = []

    constructor(field: string) {
        this.field = field
    }

    push(chain: string) {
        if (this.chains.indexOf(chain) === -1) this.chains.push(chain)
    }
}

class ValidateChain implements ValidateChainInterface {
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

    private getChainResult(): ChainResult {
        return this.check.getResults().get(this.field)
    }
}

class ValidateCheck implements ValidateChainInterface {
    private fields: fields
    private message: string
    private chains: Map<string, chainOptions> = new Map()
    private chainCustoms: Map<string, chainHandle> = new Map()
    private results: Map<string, ChainResult> = new Map()

    constructor(fields?: fields, message?: any) {
        this.fields = fields
        this.message = message

        if (isArray(this.fields)) {
            this.fields.map(field => this.results.set(field, new ChainResult()))
        } else {
            this.results.set(this.fields, new ChainResult())
        }
    }

    run(object: any): ValidateCheck {
        if (isArray(this.fields)) {
            this.fields.map(field => this.fieldCheck(object, field))
        } else {
            this.fieldCheck(object, this.fields)
        }

        return this
    }

    isRequired(): ValidateCheck {
        return this.push("isRequired")
    }

    isNotEmpty(): ValidateCheck {
        return this.push("isNotEmpty")
    }

    isNumber(): ValidateCheck {
        return this.push("isNumber")
    }

    isString(): ValidateCheck {
        return this.push("isString")
    }

    isEmail(): ValidateCheck {
        return this.push("isEmail")
    }

    isURL(): ValidateCheck {
        return this.push("isURL")
    }

    isIn(array: any) {
        return this.push("isIn", { in: array })
    }

    isMin(min: number) {
        return this.push("isMin", { min: min })
    }

    isMax(max: number) {
        return this.push("isMax", { max: max })
    }

    isLength(min: number, max: number) {
        return this.push("isLength", { min: min, max: max })
    }

    custom(nsp: string, handle: chainHandle): ValidateCheck {
        this.push(nsp)
        this.chainCustoms.set(nsp, handle)
        return this
    }

    hasCustom(nsp: string): boolean {
        return this.chainCustoms.has(nsp)
    }

    getCustomHandle(nsp: string): chainHandle {
        return this.chainCustoms.get(nsp)
    }

    getFields(): string | string[] | undefined {
        return this.fields
    }

    getChains(): Map<string, chainOptions> {
        return this.chains
    }

    getResults(): Map<string, ChainResult> {
        return this.results
    }

    private push(key: string, options?: chainOptions): ValidateCheck {
        if (!this.chains.has(key)) this.chains.set(key, options)

        return this
    }

    private fieldCheck(object: any, field: string) {
        new ValidateChain(object, field, this).run()
    }
}

export function checker(fields?: fields, message?: any): ValidateCheck {
    return new ValidateCheck(fields, message)
}
