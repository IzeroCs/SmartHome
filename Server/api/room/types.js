module.exports = ({ route }) => {
    route.get((req, res) => {
        res.json([
            "living_room",
            "bed_room",
            "kitchen_room",
            "bath_room",
            "balcony_room",
            "stairs_room",
            "fence_room",
            "mezzanine_room",
            "roof_room"
        ])
    });
};
