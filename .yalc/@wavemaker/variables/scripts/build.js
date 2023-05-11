var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require('fs-extra');
var path = require('path');
var projectDir = '.';
var yargs = require('yargs');
var hideBin = require('yargs/helpers').hideBin;
var tar = require('tar');
var execa = require('execa');
function updatePackageVersion(packagePath, key, version) {
    return __awaiter(this, void 0, void 0, function () {
        var content;
        return __generator(this, function (_a) {
            content = fs.readFileSync(packagePath, 'utf8');
            content = content.replace(new RegExp("\"" + key + "\"\\s*:\\s*\"[^\"]*\""), "\"" + key + "\": \"" + version + "\"");
            fs.writeFileSync(packagePath, content);
            return [2 /*return*/];
        });
    });
}
function updateSourceMapFile(path) {
    if (fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach(function (p) { return updateSourceMapFile(path + "/" + p); });
    }
    else if (path.endsWith('js.map')) {
        var content = JSON.parse(fs.readFileSync(path, 'utf8'));
        content.sources[0] = content.sources[0].split('/').pop();
        fs.writeFileSync(path, JSON.stringify(content));
    }
}
function postBuild(runtimeVersion) {
    return __awaiter(this, void 0, void 0, function () {
        var packageData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // updateSourceMapFile(`${projectDir}/dist/es2015`);
                    fs.copySync(projectDir + "/package.json", projectDir + "/dist/es2015/package.json");
                    packageData = fs.readJSONSync(projectDir + "/package.json", {
                        encoding: "utf8"
                    });
                    packageData.main = 'index';
                    packageData.module = 'index';
                    packageData.exports = {
                        "./": "./"
                    };
                    delete packageData['files'];
                    fs.writeFileSync(projectDir + "/dist/es2015/package.json", JSON.stringify(packageData, null, 2));
                    return [4 /*yield*/, updatePackageVersion(projectDir + "/dist/es2015/package.json", 'version', runtimeVersion)];
                case 1:
                    _a.sent();
                    console.log('Post Build successful!!!');
                    return [2 /*return*/];
            }
        });
    });
}
function prepareNpmPackages() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs.copySync(projectDir + "/dist/es2015", projectDir + "/dist/npm-packages/variables", {
                        filter: function (p) { return !p.startsWith('/node_modules/'); }
                    });
                    return [4 /*yield*/, execa('tar', ['-czf', 'dist/npm-packages/variables.tar.gz', '-C', 'dist/npm-packages', 'variables'])];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function pushToLocalRepo() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    fs.writeFileSync(projectDir + "/dist/new-build", '' + Date.now);
                    return [4 /*yield*/, execa('yalc', ['publish', '--no-sig', '--push'], {
                            'cwd': projectDir + "/dist/es2015"
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
yargs(hideBin(process.argv)).command('post-build', 'to run post processing after project build', function (yargs) {
    yargs.option('runtimeVersion', {
        describe: 'version number',
        type: 'string',
        default: '1.0.0-dev'
    }).option('production', {
        describe: 'to perform a production build',
        type: 'boolean',
        default: false
    });
}, function (argv) {
    postBuild(argv.runtimeVersion).then(function () {
        if (argv.production) {
            return prepareNpmPackages();
        }
        else {
            return pushToLocalRepo();
        }
    });
}).showHelpOnFail().argv;
//# sourceMappingURL=build.js.map