import { isArray } from "util"
import { ValidateCheck } from "./validate/check.validate"
import { ValidateError } from "./validate/error.validate"
import { ValidateChainResult } from "./validate/chain.result.validate"

export type fields = string | string[]
export type chainOptions = { min?: number; max?: number; in?: any }
export type chainHandle = (field: string, value: any) => any

export class Validate {
    private list: Array<ValidateCheck> = []

    constructor(checks?: ValidateCheck[]) {
        if (checks) checks.map(check => this.list.push(check))
    }

    add(check: ValidateCheck) {
        this.list.push(check)
        return check
    }

    addAll(checks: ValidateCheck[]) {
        if (isArray(checks)) checks.map(check => this.add(check))
    }

    check(fields?: fields, message?: any): ValidateCheck {
        const check = new ValidateCheck(fields, message)
        this.list.push(check)

        return check
    }

    execute(object: any): ValidateError[] {
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

        return Array.from(errors.values())
    }

    private resultToError(field: string, result: ValidateChainResult, errors: Map<string, ValidateError>) {
        let resultKeys = Object.keys(result)
        let errorValidate: ValidateError = null

        if (errors.has(field)) errorValidate = errors.get(field)
        else errorValidate = new ValidateError(field)

        for (let i = 0; i < resultKeys.length; ++i) {
            let key = resultKeys[i]
            let value = result[key]

            if (typeof value !== "boolean" || value === false) errorValidate.push(key)
        }

        if (errorValidate.getChains().length > 0) errors.set(field, errorValidate)
    }
}

export function checker(fields?: fields, message?: any): ValidateCheck {
    return new ValidateCheck(fields, message)
}
