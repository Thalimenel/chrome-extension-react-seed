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
    fs.readdirSync(`./src/${folder}`, {
        recursive: true,
        withFileTypes: true
    }).forEach(file => {
        if (file.isFile()) {
            let { name, path: parentPath } = file;
            if (/^\w/.test(parentPath)) {
                parentPath = `./${parentPath}`;
            }
            let jsFile = name.replace(/\.ts/, '.js');
            const subDir = parentPath.replace(/\.\/src\//, '');

            const targetFolder = `build/${subDir}`;
            fs.mkdirSync(targetFolder, { recursive: true });
            module.exports.push({
                mode: 'production',
                entry: `${parentPath}/${jsFile}`,
                output: {
                    filename: `${jsFile}`,
                    path: path.resolve(__dirname, targetFolder),
                },
            });
        }
    });
})




