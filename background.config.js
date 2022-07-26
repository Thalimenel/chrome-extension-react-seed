const path = require('path');
const fs = require('fs');

module.exports = [
    {
        mode: 'production',
        entry: './src/background/background.js',
        output: {
            filename: 'background.js',
            path: path.resolve(__dirname, 'build'),
        },
    }
];

['content-scripts', 'web-accessible-resources'].forEach(folder => {
    fs.readdirSync(`./src/${folder}`).forEach(file => {
        let jsFile = file.replace(/\.ts/, '.js');
        module.exports.push({
            mode: 'production',
            entry: `./src/${folder}/${jsFile}`,
            output: {
                filename: `${jsFile}`,
                path: path.resolve(__dirname, `build/${folder}`),
            },
        })
    });
})




