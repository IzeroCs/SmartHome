const mongo = require("../mongo")
const model = mongo.model("setting", {
    version: String
})

module.exports = (() => {
    model.countDocuments({}).then(count => {
        if (count > 0)
            return

        const record = new model({
            version: "1.0"
        })

        record.save()
              .then(doc => console.log("[mongo:setting] Created setting first"))
              .catch(err => {
                  console.error("[mongo:setting] Failed create setting first")
                  console.error(err)
              })
    }).catch(err => console.error(err))

    return {}
})()
