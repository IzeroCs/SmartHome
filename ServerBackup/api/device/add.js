const promise = require("promise");
const func    = require("../function");

module.exports = (route, db, check, validator, devices) => {
    route.get((req, res) => {
        res.send(require("../../devices.json"));
    }).put([
        check("device", "Device type is required").not().isEmpty(),
        check("name", "Device name is required").not().isEmpty(),
        check("name", "Device name must be at least 3 characters").isLength({ min: 3 }),
        check("nicknames", "Device nicknames is required").not().isEmpty(),
        check("traits", "Traits options required").not().isEmpty(),
        check("device").custom(async (value, { req }) => {
            if (!req.body.device)
                return;

            if (await devices.isDevice(value) === false)
                return promise.reject("Device type <strong>" + value + "</strong> invalid");
        }),
        check("name").custom(async (value, { req }) => {
            if (req.body.name && await devices.isNameExists(value))
                return promise.reject("Device name <strong>" + value + "</strong> is exists")
        }),
        check("nicknames").custom(async (value, { req }) => {
            if (!req.body.nicknames)
                return;

            let ref = { exists: [] };

            if (await devices.isNicknamesExists(value, ref))
                return promise.reject("Device nickname <strong>" + ref.exists.join(", ") + "</strong> is exists");
        }),
        check("traits").custom(async (value, { req }) => {
            if (!req.body.device || !req.body.traits)
                return;

            let ref = { exists: [], required: {}, matched: {} };

            if (await devices.isTraits(req.body.device, req.body.traits, ref) === false) {
                if (ref.exists && ref.exists.length > 0) {
                    return promise.reject("Traits options <strong>" + func.ucwords(ref.exists.join(", ")) + "</strong> invalid");
                } else {
                    let obj   = null;
                    let msg = null;
                    let lists = [];

                    if (!func.isEmptyObject(ref.required)) {
                        obj   = ref.required;
                        msg = "Traits options required:";
                    } else if (!func.isEmptyObject(ref.matched)) {
                        obj   = ref.matched;
                        msg = "Traits options matched:";
                    }

                    if (typeof obj !== "undefined") {
                        let buff = "";

                        for (let key in obj) {
                            let items    = obj[key];
                            let keyUpper = func.ucwords(key);

                            buff += keyUpper;
                            buff += " { ";

                            if (items && items.length > 0) for (let j = 0; j < items.length; ++j) {
                                if (j > 0)
                                    buff += ", ";

                                buff += items[j].label;
                            }

                            buff += " } ";
                            lists.push(buff);
                        }

                        return promise.reject({
                            msg  : msg,
                            lists: lists
                        });
                    }
                }
            }
        })
    ], async (req, res) => {
        let errors = validator(req);

        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });
        else
            errors = [];

        if (await devices.create(
            req.body.device,
            req.body.name,
            req.body.nicknames,
            req.body.traits,
            errors
        )) {
            res.send({
                message: "Create device <strong>" + req.body.name + "</strong> success",
                type: "success"
            });
        } else {
            return res.status(422).json({ errors: errors });
        }
    }).post((req, res) => {
        res.send({
            message: "Post success",
            type: "success"
        });
    });
};
