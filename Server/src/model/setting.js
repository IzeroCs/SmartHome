const mongo = require("../mongo")
const model = mongo.model("setting", {
    version: String,
    created_at: Date,
    updated_at: Date
})

module.exports = (() => {
    model.countDocuments({}).then(count => {
        if (count > 0)
            return

        const date = new Date()
        const record = new model({
            version: "1.0",
            created_at: date,
            updated_at: date
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
