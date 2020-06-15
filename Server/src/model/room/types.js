const mongo = require("../../mongo")
const tag   = "[mongo:room.types]"
const model = mongo.model("room.types", {
    name: String,
    type: Number,
    enable: Boolean,
    create_at: Date,
    update_at: Date
})

let types = []
const def = {
    living_room   : 1,
    bed_room      : 2,
    kitchen_room  : 3,
    bath_room     : 4,
    balcony_room  : 5,
    stairs_room   : 6,
    fence_room    : 7,
    mezzanine_room: 8,
    roof_room     : 9
}

module.exports = (() => {
    model.find({}).then(docs => {
        if (types.length > 0)
            return

        if (docs.length > 0) {
            types = docs
            return
        }

        const keys = Object.keys(def)

        keys.forEach(name => {
            const date = new Date()
            const record = new model({
                name: name,
                type: def[name],
                enable: true,
                create_at: date,
                update_at: date
            })

            record.save().catch(err => console.error(err))
        })
    }).catch(err => console.error(err))

    return {
        getList: () => types
    }
})()
