const { spawnSync } = require('child_process');
const path = require('path');

let processArgs = process.argv;
if (processArgs.findIndex(arg => arg.startsWith('--max-old-space-size')) !== -1) {
    process.env.NODE_OPTIONS = processArgs.pop();
    console.log("Setting node options: ", process.env.NODE_OPTIONS);
}
const random_number = Date.now();
const outputDir = `dist/ng-bundle/${random_number}`;

const args = processArgs.slice(2);
let argsObj = {};
args.forEach(arg => {
    const [key, value] = arg.split('=');
    if (value) {
        argsObj[key] = value;
    }
});

// Update or add deploy-url with random_number
if (argsObj['--deploy-url']) {
    argsObj['--deploy-url'] = `${argsObj['--deploy-url']}${random_number}/`;
} else {
    argsObj['--deploy-url'] = `./ng-bundle/${random_number}/`;
}

argsObj['--output-path'] = outputDir;

// Convert back to array format
const finalArgs = Object.entries(argsObj).map(([key, value]) => `${key}=${value}`);


const ngBuildArgs = ['build', ...finalArgs];
console.log("\x1b[33m", "Angular build params: ", ngBuildArgs);

//Trigger angular build with the passed params
const ngPath = path.resolve(process.cwd(), 'node_modules', '.bin', "ng");
const ngBuildProcess = spawnSync(ngPath, ngBuildArgs, {stdio: 'inherit', shell: true});

if (ngBuildProcess.status === 0) {
    console.log('ng build completed successfully!');
} else {
    // TODO: JS heap out of memory error handling
    console.error('Error during ng build:', ngBuildProcess.error || ngBuildProcess.stderr);
    process.exit(1);
}

const ngPostBuildArgs = ['build-scripts/post-build.js', ...finalArgs, `--random-number=${random_number}`];
console.log("Post build params - ", ngPostBuildArgs);

const ngPostBuildProcess = spawnSync('node', ngPostBuildArgs, { stdio: 'inherit' });

if (ngPostBuildProcess.status === 0) {
    console.log('ng post build completed successfully!');
} else {
    console.error('Error during ng build:', ngPostBuildProcess.error || ngPostBuildProcess.stderr);
    process.exit(1);
}
