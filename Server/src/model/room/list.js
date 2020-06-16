const mongo = require("../../mongo")
const tag   = "[mongo:room.list]"
const model = mongo.model("room.list", {
    name: String,
    type: Number,
    enable: Boolean
})

let lists = []
const def = {
    1: "Phòng khách",
    2: "Phòng ngủ",
    3: "Phòng bếp",
    4: "Phòng tắm",
    5: "Ban công",
    6: "Cầu thang",
    7: "Sân nhà",
    8: "Gác lửng",
    9: "Gác mái"
}

module.exports = (() => {
    model.find({}).then(docs => {
        if (lists.length > 0)
            return

        if (docs.length > 0) {
            lists = docs
            return
        }

        const keys = Object.keys(def)

        keys.forEach(type => {
            const record = new model({
                name: def[type],
                type: type,
                enable: true
            })

            record.save().catch(err => console.error(err))
        })
    }).catch(err => console.error(err))

    return {
        getList: () => lists
    }
})()
