import { ValidateError } from "./util/validate/error.validate"

export enum NSP {
    hasNotChanged = "hasNotChanged",
    moduleNotExists = "moduleNotExists",
    deviceNotExists = "deviceNotExists",
    deviceNotOnline = "deviceNotOnline"
}

export class ErrorModel {
    public error: string = "ErrorModel"
    public validates: ValidateError[] = []
    public nsp: NSP
}
