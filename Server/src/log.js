const fs     = require("fs")
const util   = require("util")
const access = fs.createWriteStream(__dirname + "/../assets/logs/access.log", { flags: "a+" })
const error  = fs.createWriteStream(__dirname + "/../assets/logs/error.log", { flags: "a+" })

module.exports = (() => {
    const date = new Date()
    const buff = "=======================================[" + date.toLocaleString("vi-VN") +
                "]=======================================\n"

    access.write(buff)
    error.write(buff)
})()

console.log = (...message) => {
    let date   = new Date()
    let buffer = ""

    message.forEach((msg, index) => {
        buffer += msg

        if (index === 0)
            buffer += " "

    })

    process.stdout.write(buffer + "\n")
    access.write(date.toLocaleString("vi-VN") + ": " + buffer + "\n")
}

console.error = (...message) => {
    let date   = new Date()
    let buffer = ""

    message.forEach((msg, index) => {
        buffer += msg

        if (index === 0)
            buffer += " "

    })

    process.stderr.write(buffer + "\n")
    error.write(date.toLocaleString("vi-VN") + ": " + buffer + "\n")
}
