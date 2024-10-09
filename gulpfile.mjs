import 'dotenv/config'
import gulp from 'gulp';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { promisify } from 'util';
import path from 'path';
import AdmZip from 'adm-zip';
import { rimraf } from 'rimraf';
import glob from "glob";
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import replace from 'gulp-replace';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const { series, parallel, src, dest } = gulp;
const { sync } = glob;

const execPromise = promisify(exec);

const logError = msg => console.log(`[\x1b[38;5;240m${(new Date()).toTimeString().split(' ')[0]}\x1b[0m] \x1b[31m\x1b[1m%s\x1b[0m`, msg);

const destinationFolder = 'build';
const packageFolder = 'package';
const packageFileName = `${process.env.npm_package_name || 'package'}.zip`;

const clean = path => () => {
    let paths = sync(path)
    return rimraf(paths);
}


const cleanPackage = clean(`${packageFolder}/**/*.*`);
cleanPackage.displayName = 'Clean Package Folder'


const build = (cb) => {
    exec('yarn run build', cb);
}
build.displayName = 'Building Package'

const tscBG = async () => {
    await execPromise('tsc --project ./bg.tsconfig.json');
}
tscBG.displayName = 'TSC on scripts';

const addJSToImport = () => {
    return src('../tracking-tag/**/*.js')
        .pipe(replace(/from "([^"]+)"/g, (m, g1) => {
            if (g1 && !/\.js$/.test(g1)) {
                return `from "${g1}.js"`
            }
            return m;
        }))
        .pipe(dest(vinyl => vinyl.base));
}
addJSToImport.displayName = 'Change Tag dependencies';

const webpackBG = async () => {
    await execPromise('webpack --config background.config.js');
}
webpackBG.displayName = 'Bundling scripts';

const cleanJS = clean('./src/**/*.js');
cleanJS.displayName = 'Cleaning js files'

const checkManifest = async () => {
    let packageFile = `${__dirname}${path.sep}${packageFolder}${path.sep}${packageFileName}`;
    if (existsSync(packageFile)) {
        let zip = new AdmZip(packageFile);
        let manifest = JSON.parse(zip.readAsText("manifest.json"));
        let oldVersion = manifest.version;
        let realManifest = await readFile(`./package.json`, { encoding: 'utf8' });
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

function zipPackage(cb) {
    let packageFile = `${__dirname}${path.sep}${packageFolder}${path.sep}${packageFileName}`;
    let zip = new AdmZip();
    zip.addLocalFolder(`${__dirname}${path.sep}${destinationFolder}`);
    zip.writeZip(packageFile);
    cb();
}
zipPackage.displayName = 'Zipping'


async function update_manifest_ver() {
    const buildManifest = `${__dirname}${path.sep}${destinationFolder}${path.sep}manifest.json`;
    const manifestStr = await readFile(buildManifest, { encoding: 'utf8' });
    let realManifest = await readFile(`./package.json`, { encoding: 'utf8' });
    try {
        let newVersion = JSON.parse(realManifest).version;
        const manifest = JSON.parse(manifestStr);
        manifest.version = newVersion;
        await writeFile(buildManifest, JSON.stringify(manifest, null, 4), { encoding: 'utf8' });
    }
    catch { }
    return
}


const pack = series(checkManifest, parallel(cleanPackage, build), zipPackage);
const build_background = series(cleanJS, tscBG, addJSToImport, webpackBG, cleanJS)


export { build as default };
export {
    build,
    pack,
    build_background,
    cleanJS,
    addJSToImport,
    update_manifest_ver
};
