const mongo = require("../src/mongo")
const tag   = "[mongo:esp]"

module.exports = mongo.model("esp", {
    name: String,
    online: Boolean,
    pins: Array,
    detail: Array,
    authenticate: String
})

module.exports.addModule = (espID) => {
    console.log(tag, "Esp ID: ", espID)
}
