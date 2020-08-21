import { isArray, isUndefined } from "util"

export function defineKeys(keys: Array<any>, dest: Array<any>): any {
    if (!isArray(keys)) return dest
    if (!isArray(dest)) return dest

    let res = {}

    for (let i = 0; i < dest.length; ++i) {
        if (!isUndefined(keys[i])) {
            Object.defineProperty(res, keys[i], {
                value: dest[i],
                writable: true,
                enumerable: true,
                configurable: true
            })
        }
    }

    return res
}
