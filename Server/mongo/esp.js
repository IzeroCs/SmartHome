const mongo = require("../src/mongo")

module.exports = mongo.model("esp", {
    name: String
})
