export enum IOPin {
    IOPin_0 = 0,
    IOPin_1 = 1,
    IOPin_2 = 2,
    IOPin_3 = 3,
    IOPin_4 = 4,
    IOPin_5 = 5,
    IOPin_6 = 6,
    IOPin_7 = 7,
    IOPin_NUll = 8
}

export enum StatusCloud {
    StatusCloud_IDLE = 1,
    StatusCloud_ON = 2,
    StatusCloud_OFF = 3
}

export type DetailType = {
    detail_rssi?: number
}

export const EspPinCast = [
    "input",
    "outputType",
    "outputPrimary",
    "outputSecondary",
    "dualToggleCount",
    "dualToggleTime",
    "statusClient",
    "statusCloud"
]

export type EspPin = {
    input?: IOPin
    outputType?: IOPin
    outputPrimary?: IOPin
    outputSecondary?: IOPin
    dualToggleCount?: IOPin
    dualToggleTime?: number
    statusCloud?: StatusCloud
    statusClient?: boolean
}

export type EspModule = {
    name: string
    online: boolean
    auth: boolean
    changed: boolean
    pins: Array<EspPin>
    detail_rssi: number
}