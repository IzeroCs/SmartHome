const mongo = require("../mongo")
const tag   = "[mongo:room]"
let datas = {
    types: [],
    list: []
}

const defs = {
    types: {
        living_room   : 1,
        bed_room      : 2,
        kitchen_room  : 3,
        bath_room     : 4,
        balcony_room  : 5,
        stairs_room   : 6,
        fence_room    : 7,
        mezzanine_room: 8,
        roof_room     : 9
    },

    list: {
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
}

const model = {
    types: mongo.model("room.types", {
        name: String,
        type: Number,
        enable: Boolean
    }),

    list: mongo.model("room.list", {
        name: String,
        enable: Boolean,
        type: {
            type: mongo.types.id,
            ref: "room.types"
        }
    })
}

const init = {
    types: () => {
        model.types.find({}).then(docs => {
            if (datas.types.length > 0)
                return

            if (docs.length > 0) {
                datas.types = docs
                return
            } else {
                console.log(tag, "Create first data room types")
            }

            const keys = Object.keys(defs.types)

            keys.forEach(name => {
                const record = new model.types({
                    name: name,
                    type: defs.types[name],
                    enable: true
                })

                record.save().catch(err => console.error(err))
            })
        }).catch(err => console.error(err))
    },

    list: () => {
        model.list.find({}).populate("type").exec((err, docs) => {
            if (err)
                return console.error(tag, err)

            if (datas.list.length > 0)
                return

            if (docs.length > 0) {
                datas.list = docs
            } else {
                console.log(tag, "Create first data room list")
                const keys = Object.keys(defs.list)

                keys.forEach(type => {
                    model.types.findOne({ type: type }).then(docs => {
                        const record = new model.list({
                            name: defs.list[type],
                            enable: true,
                            type: docs._id
                        })

                        record.save().catch(err => console.error(err))
                    }).catch(err => console.error(err))
                })
            }
        })
    }
}

module.exports = (() => {
    init.types()
    init.list()

    return {
        model: model,
        datas: datas
    }
})()

module.exports.findOne = {
    list: {
        byId: (id) => model.list.findById(id),
        byName: (name) => model.list.findOne({ name: name })
    }
}
