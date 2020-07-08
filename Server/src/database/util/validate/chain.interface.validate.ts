import { chainHandle } from "../validate.util"
export interface ValidateChainInterface {
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
