module.exports = ({ route }) => {
    route.get((req, res) => {
        res.json({
            types: {
                living_room: {
                    label: "Living room",
                    icon: ""
                },
                bed_room: {
                    label: "Bed room",
                    icon: ""
                }
            }
        })
    });
};
