module.exports = {
    apps: [
        {
            name: "smarthome",
            script: "dist/main.js",
            instances: "max",
            exec_mode: "cluster",
            cwd: "/home/izerocs/smarthome/current/Server",
            watch: false,

            env: {
                NODE_ENV: "local"
            },

            env_production: {
                NODE_ENV: "production"
            }
        }
    ],

    deploy: {
        production: {
            user: "izerocs",
            host: "izerocs.com",
            ref: "origin/master",
            repo: "https://github.com/IzeroCs/SmartHome.git",
            path: "/home/izerocs/smarthome",
            ssh_options: "StrictHostKeyChecking=no",
            "pre-deploy-local": "",
            "post-deploy":
                "chmod +x /home/izerocs/smarthome/current/Server/.install && /home/izerocs/smarthome/current/Server/.install",
            "pre-setup": ""
        }
    }
}
