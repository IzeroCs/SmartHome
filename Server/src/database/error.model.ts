import { ValidateError } from "./util/validate/error.validate"

export class ErrorModel {
    public validates: ValidateError[] = []
    public nsp: string
}
