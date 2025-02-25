const { spawnSync } = require('child_process');
const path = require('path');

let processArgs = process.argv;

// Handle memory limit adjustments
if (processArgs.findIndex(arg => arg.startsWith('--max-old-space-size')) !== -1) {
    process.env.NODE_OPTIONS = processArgs.pop();
    console.log("Setting node options: ", process.env.NODE_OPTIONS);
}

const args = processArgs.slice(2);

const preBuildScript = path.resolve(process.cwd(), 'build-scripts', 'remove-unused-locales.js');
console.log("\x1b[33m", "Running pre-build cleanup:", preBuildScript);

const preBuildProcess = spawnSync('node', [preBuildScript], { stdio: 'inherit' });

if (preBuildProcess.status === 0) {
    console.log('Pre-build cleanup completed successfully!');
} else {
    console.error('Error during pre-build cleanup:', preBuildProcess.error || preBuildProcess.stderr);
    process.exit(1);
}

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

const ngPostBuildArgs = ['build-scripts/post-build.js', ...args];
console.log("Post build params - ", ngPostBuildArgs);

const ngPostBuildProcess = spawnSync('node', ngPostBuildArgs, { stdio: 'inherit' });

if (ngPostBuildProcess.status === 0) {
    console.log('ng post build completed successfully!');
} else {
    console.error('Error during ng build:', ngPostBuildProcess.error || ngPostBuildProcess.stderr);
    process.exit(1);
}
