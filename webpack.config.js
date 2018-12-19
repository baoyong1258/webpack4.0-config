const configMap = {
    development: './config/webpack.development.js',
    production: './config/webpack.production.js'
}

module.exports = (env, argv) => {
    const NODE_ENV = argv.mode;
    console.log('NODE_ENV = ' + NODE_ENV);
    const config = require(configMap[NODE_ENV]);
    return config;
}