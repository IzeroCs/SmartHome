const promise = require("promise");
const func    = require("./function");
const lists   = require("../devices.json");

const devices = (routes) => {
    const caller = (() => {
        const path = "/devices";
        const ref  = routes.db.ref(path);

        async function query(callback) {
            let snap = await ref.orderByKey().once("value");

            if (snap.exists()) {
                let lists   = snap.toJSON();
                let numList = snap.numChildren();

                for (let i = 0; i < numList; ++i) {
                    res = callback(i, lists[i]);

                    if (typeof res !== "undefined")
                        return res;
                }
            }

            return false;
        }

        async function create(type, name, nicknames, traits, errors) {
            let snap    = await ref.orderByKey().once("value");
            let index   = 0;
            let success = true;
            let sets    = {
                type     : type,
                name     : name,
                nicknames: nicknames.split(", "),
                traits   : traits
            };

            for (let key in sets.traits) {
                if (func.isEmptyObject(sets.traits[key]))
                    sets.traits[key] = "active";
            }

            if (typeof errors === "undefined")
                errors = [];

            if (snap.exists())
                index = snap.numChildren();

            await ref.child(index).set(sets).then(() => {
                success = true;
            }).catch(err => {
                success = false;
                errors.push({ msg: err });
            });

            return success;
        }

        async function list() {
            let snap = await ref.orderByKey().once("value");

            if (snap.exists())
                return await snap.toJSON();

            return {};
        }

        async function isDevice(type) {
            type = type.toLowerCase();

            if (!lists)
                return false;

            let valid = false;

            for (let name in lists) {
                name = name.toLowerCase();

                if (type === name) {
                    valid = true;
                    break;
                }
            }

            return valid;
        }

        async function isNameExists(name) {
            name = name.toLowerCase();

            return await query((index, items) => {
                if (items && items.name && name === items.name.toLowerCase())
                    return true;
            });
        }

        async function isNicknamesExists(nicknames, ref) {
            let exists = false;

            if (typeof nicknames === "string")
                nicknames = nicknames.split(", ");

            nicknames.forEach((value, index) => {
                nicknames[index] = nicknames[index].toLowerCase();
            });

            await query((index, items) => {
                if (items && items.nicknames) {
                    let arrays = items.nicknames;

                    for (let i = 0; i < Object.keys(arrays).length; ++i) {
                        if (nicknames.indexOf(arrays[i].toLowerCase()) !== -1) {
                            if (typeof ref.exists === "undefined")
                                ref.exists = [];
                            else
                                ref.exists.push(arrays[i]);

                            exists = true;
                        }
                    }
                }
            });

            return exists;
        }

        async function isTraits(device, items, ref) {
            if (typeof lists[device] === "undefined")
                return false;

            if (ref === undefined) {
                ref = {
                    exists  : [],
                    required: {},
                    matched : {}
                };
            }

            let traits = Object.assign({}, lists[device].traits);

            for (let key in traits) {
                Object.defineProperty(traits, key.toLowerCase(), Object.getOwnPropertyDescriptor(traits, key));
                delete traits[key];
            }

            function check(traitKeyParent, traitAttrs, itemAttrs) {
                let isRequired = true;
                let isMatched  = true;

                for (let traitKey in traitAttrs) {
                    let traitVal  = traitAttrs[traitKey];

                    // TODO Check required
                    if (traitVal.required && traitVal.required === true) {
                        let required = true;

                        if (!itemAttrs.hasOwnProperty(traitKey))
                            required = false;

                        if (!itemAttrs[traitKey] || itemAttrs[traitKey] === null)
                            required = false;
                        else if (String(itemAttrs[traitKey]).length <= 0)
                            required = false;

                        if (!required) {
                            isRequired = false;

                            if (typeof ref.required[traitKeyParent] === "undefined")
                                ref.required[traitKeyParent] = [];

                            ref.required[traitKeyParent].push({
                                key  : traitKey,
                                label: traits[traitKeyParent][traitKey].label
                            });
                        }
                    }
                }

                // TODO Check matched
                if (isRequired) {
                    function isTypeString(val, equals) {
                        if (typeof val !== "string")
                            return false;

                        if (typeof equals !== "object" && typeof equals !== "string")
                            return true;

                        if (typeof equals === "string")
                            equals = [ equals ];

                        let keys  = Object.keys(equals);
                        let match = false;

                        for (let i = 0; i < keys.length; ++i) {
                            let eq = equals[keys[i]];

                            if (eq.compile)
                                match = eq.test(val);
                            else if (eq === val)
                                match = true;
                        }

                        return match;
                    }

                    function isTypeInteger(val, is) {
                        if (isNaN(val) || !isFinite(val))
                            return false;

                        if (typeof val === "string")
                            val = parseInt(val);

                        if (is.min && val < is.min)
                            return false;

                        if (is.max && val > is.max)
                            return false;

                        return true;
                    }

                    for (let itemKey in itemAttrs) {
                        let itemVal  = itemAttrs[itemKey];
                        let traitVal = traitAttrs[itemKey];
                        let matched  = true;

                        if (traitVal.type && traitVal.type !== "any") {
                            type = traitVal.type.toLowerCase();

                            if (type === "string" && !isTypeString(itemVal, traitVal.equals))
                                matched = false;
                            else if (type === "integer" && !isTypeInteger(itemVal, traitVal.is))
                                matched = false;

                            if (!matched) {
                                isMatched = false;

                                if (typeof ref.matched[traitKeyParent] === "undefined")
                                    ref.matched[traitKeyParent] = [];

                                ref.matched[traitKeyParent].push({
                                    key: itemKey,
                                    label: traits[traitKeyParent][itemKey].label
                                });
                            }
                        }
                    }
                }

                return isRequired && isMatched;
            }

            let isCheck = true;

            for (let itemKey in items) {
                let itemVal = items[itemKey];

                if (traits.hasOwnProperty(itemKey)) {
                    if (Object.keys(itemVal).length > 0 && !check(itemKey, traits[itemKey], itemVal))
                        isCheck = false;
                } else {
                    isCheck = false;

                    if (!ref.exists)
                        ref.exists = [];

                    ref.exists.push(itemKey);
                }
            }

            return isCheck;
        }

        return {
            list             : list,
            create           : create,
            isDevice         : isDevice,
            isTraits         : isTraits,
            isNameExists     : isNameExists,
            isNicknamesExists: isNicknamesExists
        };
    })();

    routes.route("device/add", caller);
    routes.route("device/list", caller);
};

module.exports = devices;
