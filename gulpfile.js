const { series, parallel, src, dest } = require('gulp');
const path = require("path");
const util = require('util');
const fs = require("fs");
const fsPromises = fs.promises;
const AdmZip = require('adm-zip');
const zip = require('gulp-zip');
const rimraf = require('rimraf');

const exec = util.promisify(require('child_process').exec);

const logError = msg => console.log(`[\x1b[38;5;240m${(new Date()).toTimeString().split(' ')[0]}\x1b[0m] \x1b[31m\x1b[1m%s\x1b[0m`, msg);


const destinationFolder = 'build';
const packageFolder = 'package';
const packageFileName = `${process.env.npm_package_name || 'package'}.zip`;

const clean = path => cb => {
    rimraf(path, cb);
}


const cleanPackage = clean(`${packageFolder}/**/*.*`);
cleanPackage.displayName = 'Clean Package Folder';


const build = (cb) => {
    exec('yarn run build', cb);
}
build.displayName = 'Building Package'

const buildNoPop = (cb) => {
    exec('yarn run build-no-popup', cb);
}
buildNoPop.displayName = 'Building Package Without Popup'

const tscBG = async () => {
    await exec('tsc --project ./bg.tsconfig.json');
}
tscBG.displayName = 'TSC on scripts'

const webpackBG = async () => {
    await exec('webpack --config background.config.js');
}
webpackBG.displayName = 'Bundling scripts';


const cleanJS = clean('./src/**/*.js');
cleanJS.displayName = 'Cleaning js files';


const checkManifest = async () => {
    let packageFile = `${__dirname}${path.sep}${packageFolder}${path.sep}${packageFileName}`;
    if (fs.existsSync(packageFile)) {
        let zip = new AdmZip(packageFile);
        let manifest = JSON.parse(zip.readAsText("manifest.json"));
        let oldVersion = manifest.version;
        let realManifest = await fsPromises.readFile(`public${path.sep}manifest.json`, { encoding: 'utf8' });
        let newVersion = JSON.parse(realManifest).version;
        if (newVersion === oldVersion) {
            logError('Error: Change Manifest Version');
        }
    }
    else {
        return;
    }
}
checkManifest.displayName = 'Check Manifest Vesrion';

function zipPackage() {
    return src(`${destinationFolder}/**/*`)
        .pipe(zip(packageFileName))
        .pipe(dest(packageFolder))
}
zipPackage.displayName = 'Zipping'

const copyAssets = () => {
    return src([`public/**/*`, '!popup/**', '!favicon.ico', '!robots.txt', '!index.html'])
        .pipe(dest(destinationFolder))
}
copyAssets.displayName = 'Copy Public Assets'

const pack = series(checkManifest, parallel(cleanPackage, build), zipPackage);
const build_background = series(cleanJS, tscBG, webpackBG, cleanJS)
const packNoPop = series(checkManifest, parallel(cleanPackage, buildNoPop), zipPackage)

exports.default = build;
exports.build = build;
exports.pack = pack;
exports.packNoPop = packNoPop;
exports.build_background = build_background;

exports.cleanJS = series(webpackBG);

exports.copyAssets = copyAssets;