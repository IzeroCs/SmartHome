const promise = require("promise");

module.exports = ({ route, check, validator }) => {
    route.get((req, res) => {
        res.send("");
    }).put([
        check("device", "Device type is required").not().isEmpty(),
        check("name", "Device name is required").not().isEmpty()
    ], (req, res) => {
        let errors = validator(req);

        if (!errors.isEmpty())
            return res.status(422).json({ errors: errors.array() });

        res.send("Render");
    });
};
