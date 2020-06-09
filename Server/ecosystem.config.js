module.exports = {
  apps : [{
    script: "index.js",
    name: "smarthome-server",
    watch: true,
    env: {
      NODE_ENV: "local"
    },
    env_production: {
      NODE_ENV: "production"
    }
  }],

  deploy : {
    production : {
      key: ".ssh/izerocs.pem",
      user : "izerocs",
      host : "18.140.132.39",
      ref  : "origin/master",
      repo : "git@github.com:IzeroCs/SmartHomeServer.git",
      path : "/home/izerocs",

      "ssh_options": "StrictHostKeyChecking=no",
      "pre-deploy-local": "",
      "post-deploy" : "npm install && pm2 reload ecosystem.config.js --env production",
      "pre-setup": ""
    },

    local: {

    }
  }
};
