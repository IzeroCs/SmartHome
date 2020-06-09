const mongoose = require("mongoose")
const url      = "mongodb://localhost:27017/smarthome"
const tag      = "[mongo]"

const types = {
    id: mongoose.Schema.Types.ObjectId,
    array: mongoose.Schema.Types.Array,
    string: mongoose.Schema.Types.String,
    documentArray: mongoose.Schema.Types.DocumentArray,
    number: mongoose.Schema.Types.Number,
    date: mongoose.Schema.Types.Date,
    buffer: mongoose.Schema.Types.Buffer,
    boolean: mongoose.Schema.Types.Boolean,
    decimal128: mongoose.Schema.Types.Decimal128,
    mixed: mongoose.Schema.Types.Mixed,
    embedded: mongoose.Schema.Types.Embedded,
    map: mongoose.Schema.Types.Map
}

module.exports = (() => {
    mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, err => {
        if (err) {
            console.log(tag, "Unable to connect to the mongoDB server")
            console.log(tag, err)

            return
        }

        console.log(tag, "Connection established to ", url)
        module.exports.include("setting")

        let esp = module.exports.include("esp")
        let nEsp = new esp({
            name: "Test"
        })

        nEsp.save()
            .then(doc => console.log(doc))
            .catch(err => console.log(err))
    })

    return {}
})()

module.exports.types = types
module.exports.schema = schema => mongoose.Schema(schema)
module.exports.model = (name, schema) => mongoose.model(name, mongoose.Schema(schema))
module.exports.include = (name) => require("../mongo/" + name)
