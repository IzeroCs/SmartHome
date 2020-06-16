const promise = require("promise")
const mongo   = require("../mongo")
const tag     = "[mongo:esp]"
const model   = mongo.model("esp", {
    name: String,
    online: Boolean,
    pins: Array,
    detail: Map,
    authenticate: Boolean
})

module.exports = model
module.exports.validateEspID = espID => espID.startsWith("ESP")
module.exports.queryModule = () => new promise((resolve, reject) => {
    model.find({ name: { $regex: "^ESP[A-Z0-9]+$" }})
        .then(docs => resolve(docs))
        .catch(err => console.error(tag, err))
})

module.exports.addModule = espID => {
    if (!module.exports.validateEspID(espID))
        return

    model.find({ name: espID }).then(docs => {
        if (docs.length <= 0) {
            const esp = new model({
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

module.exports.updateModule = (espID, data) => {
    if (!module.exports.validateEspID(espID))
        return

    model.find({ name: espID }).then(docs => {
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
