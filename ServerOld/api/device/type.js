module.exports = {
    devices: {
        light: {
            name: "Light",
            defaultName: "Smart Light",
            color: "yellow",
            icon: "light",

            options: [
                "onoff"
            ]
        },

        fan: {
            name: "Fan",
            defaultName: "Smart Fan",
            color: "blue",
            icon: "fan",

            options: [
                "onoff",
                "speed"
            ]
        },

        water_heater: {
            name: "Water Heater",
            defaultName: "Smart Water Heater",
            color: "red",
            icon: "water_heater",

            options: [
                "onoff",
                "temperature"
            ]
        }
    }
};
