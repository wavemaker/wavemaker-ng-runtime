const { spawnSync } = require('child_process');
const path = require('path');

let processArgs = process.argv;
if (processArgs.findIndex(arg => arg.startsWith('--max-old-space-size')) !== -1) {
    process.env.NODE_OPTIONS = processArgs.pop();
    console.log("Setting node options: ", process.env.NODE_OPTIONS);
}

// Extract the argument and remove it from processArgs since it is not a standard angular param
const randomHashIndex = processArgs.findIndex(arg => arg.startsWith('--random-hash'));
if (randomHashIndex !== -1) {
    const randomHashArg = processArgs.splice(randomHashIndex, 1)[0];
    const [, randomHashValue] = randomHashArg.split('=');
    global.randomHash = randomHashValue;
}

const args = processArgs.slice(2);
const ngBuildArgs = ['build', ...args];
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

const ngPostBuildArgs = ['build-scripts/post-build.js', ...args, `--random-hash=${global.randomHash}`];
console.log("Post build params - ", ngPostBuildArgs);

const ngPostBuildProcess = spawnSync('node', ngPostBuildArgs, { stdio: 'inherit' });

if (ngPostBuildProcess.status === 0) {
    console.log('ng post build completed successfully!');
} else {
    console.error('Error during ng build:', ngPostBuildProcess.error || ngPostBuildProcess.stderr);
    process.exit(1);
}
