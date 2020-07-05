import { isArray, isObject, isUndefined } from "util"
import { validate, ValidationError } from "class-validator"

export abstract class BaseModel {
    protected static validate(object: object): Promise<any> {
        return new Promise((resolve, reject) => {
            validate(object).then(errors => {
                if (errors.length > 0) return reject(errors)
                else return resolve(object)
            })
        })
    }

    protected static response(params: { data?: any; code?: any }): any {
        if (isUndefined(params.data)) params.data = {}

        if (!isArray(params.code) && !isObject(params.code))
            params.code = [params.code]

        return {
            data: params.data,
            code: params.code,
        }
    }
}
