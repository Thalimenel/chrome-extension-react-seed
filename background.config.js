const path = require('path');
const fs = require('fs');


const BACKGROUND_ENTRY = './src/background/background.js';
if (fs.existsSync(BACKGROUND_ENTRY)) {
    module.exports = [
        {
            mode: 'production',
            entry: BACKGROUND_ENTRY,
            output: {
                filename: 'background.js',
                path: path.resolve(__dirname, 'build/background'),
            },
        }
    ];
}
else {
    module.exports = [];
}

['content-scripts', 'web-accessible-resources'].forEach(folder => {
    let folderSrc = `./src/${folder}`;
    if (fs.existsSync(folderSrc)) {
        fs.readdirSync(folderSrc).forEach(file => {
            let jsFile = file.replace(/\.ts/, '.js');
            module.exports.push({
                mode: 'production',
                entry: `${folderSrc}/${jsFile}`,
                output: {
                    filename: `${jsFile}`,
                    path: path.resolve(__dirname, `build/${folder}`),
                },
            });
        });
    }
})




