const mongo = require("../src/mongo")
const model = mongo.model("setting", {
    version: String,
    created_at: mongo.types.date,
    updated_at: mongo.types.date
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
                  console.log("[mongo:setting] Failed create setting first")
                  console.log(err)
              })
    })
})()
