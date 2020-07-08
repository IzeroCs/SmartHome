import { ValidateChainInterface } from "./chain.interface.validate"
import { fields, chainOptions, chainHandle } from "../validate.util"
import { isArray } from "util"
import { ValidateChain } from "./chain.validate"
import { ValidateChainResult } from "./chain.result.validate"

export class ValidateCheck implements ValidateChainInterface {
    private fields: fields
    private message: string
    private chains: Map<string, chainOptions> = new Map()
    private chainCustoms: Map<string, chainHandle> = new Map()
    private results: Map<string, ValidateChainResult> = new Map()

    constructor(fields?: fields, message?: any) {
        this.fields = fields
        this.message = message

        if (isArray(this.fields)) {
            this.fields.map(field => this.results.set(field, new ValidateChainResult()))
        } else {
            this.results.set(this.fields, new ValidateChainResult())
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

    getResults(): Map<string, ValidateChainResult> {
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
