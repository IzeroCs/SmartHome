const asstes = __dirname + "/../../assets"
const jwt    = require("jsonwebtoken")
const fs     = require("fs")

module.exports = (platform) => {
    if (platform !== "app" && platform !== "esp")
        return

    let certPrivate = fs.readFileSync(asstes + "/" + platform + "/private.key")
    let certPublic  = fs.readFileSync(asstes + "/" + platform + "/public.key")
    let payload     = require(asstes + "/" + platform + "/payload.json")

    return {
        token: () => {
            return jwt.sign(payload, certPrivate, { algorithm: "RS256" })
        },

        verify: (token, handle) => {
            jwt.verify(token, certPublic, (err, decoded) => {
                if (!err) {
                    if (typeof decoded.name != "string" || decoded.name != payload.name)
                        return

                    if (typeof decoded.sub != "string" || decoded.sub != payload.sub)
                        return

                    return handle(err, true)
                }

                handle(err, false)
            })
        }
    }
}
