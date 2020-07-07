import { isArray, isObject, isUndefined } from "util"

export abstract class BaseModel {
    protected static response(params: { data?: any; code?: any }): any {
        if (isUndefined(params.data)) params.data = {}

        if (!isArray(params.code) && !isObject(params.code)) params.code = [params.code]

        return {
            data: params.data,
            code: params.code
        }
    }
}
