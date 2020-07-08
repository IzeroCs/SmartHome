export class ValidateError {
    private field: string = ""
    private chains: Array<string> = []

    constructor(field: string) {
        this.field = field
    }

    push(chain: string) {
        if (this.chains.indexOf(chain) === -1) this.chains.push(chain)
    }

    getChains(): Array<string> {
        return this.chains
    }
}
