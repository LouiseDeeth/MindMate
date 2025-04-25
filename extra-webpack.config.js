const webpack = require('webpack');
const dotenv = require('dotenv');

console.log('Current directory:', __dirname);

const env = dotenv.config().parsed || {};
console.log('Loaded env variables:', Object.keys(env));

const environmentVariables = {};

for (const key in env) {
  environmentVariables[`process.env.${key}`] = JSON.stringify(env[key]);
}

module.exports = {
  plugins: [
    new webpack.DefinePlugin(environmentVariables)
  ]
};