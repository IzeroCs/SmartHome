export enum IOPinEnum {
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

export enum StatusCloudEnum {
    StatusCloud_IDLE = 1,
    StatusCloud_ON = 2,
    StatusCloud_OFF = 3
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

export type EspPinType = {
    input?: IOPinEnum
    outputType?: IOPinEnum
    outputPrimary?: IOPinEnum
    outputSecondary?: IOPinEnum
    dualToggleCount?: IOPinEnum
    dualToggleTime?: number
    statusCloud?: StatusCloudEnum
    statusClient?: boolean
}

export type EspModuleType = {
    name?: string
    online?: boolean
    authentication?: boolean
    changed?: boolean
    token?: string
    pins?: Array<EspPinType>
    detail_rssi?: number
}

export type EspSyncIoType = {
    pins: Array<any>
    changed: boolean
}

export type EspSyncDetailType = {
    detail_rssi?: number
}
