export const EspPinDefineKeys = [
    "input",
    "outputType",
    "outputPrimary",
    "outputSecondary",
    "dualToggleCount",
    "dualToggleTime",
    "statusClient",
    "statusCloud"
]

export const EspDetailDefineKeys = ["detail_rssi", "detail_heap"]

export const EspSystemDefineKeys = [
    "esp_chip_id",
    "esp_free_sketch",
    "esp_boot_version",
    "esp_sdk_version",
    "esp_full_version"
]

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
    detail_heap?: number
    esp_chip_id?: number
    esp_free_sketch?: number
    esp_boot_version?: number
}

export type EspSyncIoType = {
    pins: Array<any>
    changed: boolean
}

export type EspSyncDetailType = {
    detail_rssi?: number
    detail_heap?: number
}

export type EspSyncSystemType = {
    esp_chip_id?: number
    esp_free_sketch?: number
    esp_boot_version?: number
}
