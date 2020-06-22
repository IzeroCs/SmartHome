const promise = require("promise")
const mongo   = require("../mongo")
const room    = require("./room")
const tag     = "[mongo:esp]"

const errors  = {
    addDevice: {
        NOT_ERROR: 0,
        ESP_ID_NOT_EXISTS: 1,
        ESP_PIN_NOT_EXISTS: 2,
        ROOM_ID_NOT_EXISTS: 3,
        NAME_DEVICE_IS_EXISTS: 4
    }
}

const model   = {
    esp: mongo.model("esp", {
        name: String,
        online: Boolean,
        pins: Array,
        detail: Map,
        authenticate: Boolean
    }),

    device: mongo.model("esp.device", {
        name: String,
        pinIndex: Number,
        room: { type: mongo.types.id, ref: "room.list" },
        esp: { type: mongo.types.id, ref: "esp" }
    })
}

module.exports = (() => {
    model.esp.find({ name: "ESP1N403E91636RSC185G2K"}).then(docs => {
        if (docs.length > 0)
            return

        const record = new model.esp({
            name: "ESP1N403E91636RSC185G2K",
            pins: [
                {
                    input: 0,
                    outputType: 0,
                    outputPrimary: 0,
                    outputSecondary: 1,
                    dualToggleCount: 0,
                    status: 0
                  },
                  {
                    input: 1,
                    outputType: 3,
                    outputPrimary: 1,
                    outputSecondary: 1,
                    dualToggleCount: 0,
                    status: 0
                  },
                  {
                    input: 1,
                    outputType: 0,
                    outputPrimary: 0,
                    outputSecondary: 0,
                    dualToggleCount: 0,
                    status: 0
                  },
                  {
                    input: 3,
                    outputType: 2,
                    outputPrimary: 0,
                    outputSecondary: 5,
                    dualToggleCount: 0,
                    status: 0
                  },
                  {
                    input: 3,
                    outputType: 2,
                    outputPrimary: 0,
                    outputSecondary: 5,
                    dualToggleCount: 1,
                    status: 0
                  },
                  {
                    input: 3,
                    outputType: 3,
                    outputPrimary: 0,
                    outputSecondary: 0,
                    dualToggleCount: 0,
                    status: 0
                  },
                  {
                    input: 4,
                    outputType: 0,
                    outputPrimary: 0,
                    outputSecondary: 0,
                    dualToggleCount: 0,
                    status: 0
                  },
                  {
                    input: 5,
                    outputType: 0,
                    outputPrimary: 0,
                    outputSecondary: 0,
                    dualToggleCount: 0,
                    status: 0
                  }
            ],
            online: false,
            authenticate: true,
            detail: {
                rssi: "-71"
            }
        })

        record.save()
            .then(doc => console.log(tag, "Push esp module: ", record.name))
            .catch(err => console.error(tag, err))
    }).catch(err => console.error(tag, err))

    return model
})()

module.exports.validateEspID = espID => espID.startsWith("ESP")
module.exports.queryModule = () => new promise((resolve, reject) => {
    model.esp.find({ name: { $regex: "^ESP[A-Z0-9]+$" }})
        .then(docs => resolve(docs))
        .catch(err => console.error(tag, err))
})

module.exports.addModule = espID => {
    if (!module.exports.validateEspID(espID))
        return

    model.esp.find({ name: espID }).then(docs => {
        if (docs.length <= 0) {
            const esp = new model.esp({
                name: espID,
                online: false,
                pins: [],
                detail: {},
                authenticate: false
            })

            esp.save().catch(err => console.error(tag, err))
        }
    }).catch(err => console.error(tag, err))
}

module.exports.addDevice = (espID, roomID, name, pinIndex) => {
    return new promise(async (resolve, reject) => {
        const esp = await model.esp.findById(espID)

        if (esp === null)
            return resolve(errors.addDevice.ESP_ID_NOT_EXISTS)

        if (typeof esp.pins === "undefined" || typeof esp.pins[pinIndex] === "undefined")
            return resolve(errors.addDevice.ESP_PIN_NOT_EXISTS)

        if (await room.findOne.list.byId(roomID) === null)
            return resolve(errors.addDevice.ROOM_ID_NOT_EXISTS)

        if (await module.exports.isDeviceNameExists(name))
            return resolve(errors.addDevice.NAME_DEVICE_IS_EXISTS)

        const record = new model.device({
            name: name,
            pinIndex: pinIndex,
            room: roomID,
            esp: espID
        })

        record.save()
            .then(doc => resolve(errors.addDevice.NOT_ERROR))
            .catch(err => reject(err))
    })
}

module.exports.isDeviceNameExists = async (name) => (await model.device.findOne({ name: name })) !== null

module.exports.updateModule = (espID, data) => {
    if (!module.exports.validateEspID(espID))
        return

    model.esp.find({ name: espID }).then(docs => {
        if (docs.length <= 0)
            return module.exports.addModule(espID)

        const doc = docs[0]

        if (typeof data.online !== "undefined")
            doc.online = data.online

        if (typeof data.pins !== "undefined")
            doc.pins = data.pins

        if (typeof data.detail !== "undefined")
            doc.detail = data.detail

        if (typeof data.authenticate !== "undefined")
            doc.authenticate = data.authenticate

        doc.save().catch(err => console.error(tag, err))
    }).catch(err => console.error(tag, err))
}

module.exports.findOne = {
    esp: {
        byId: (id) => model.esp.findById(id),
        byName: (name) => model.esp.findOne({ name: name })
    }
}

module.exports.errors = errors
