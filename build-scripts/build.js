const { spawnSync } = require('child_process');
const path = require('path');

let processArgs = process.argv;
const nodeVMArgs = processArgs.pop();
const args = processArgs.slice(2);
const ngBuildArgs = ['build', ...args];
console.log("Build params - ", ngBuildArgs);

//Trigger angular build with the passed params
const ngPath = path.resolve(process.cwd(), 'node_modules', '.bin', "ng");
const nodeArgs = [nodeVMArgs, ngPath, ...ngBuildArgs];
console.log('Executing command: node', nodeArgs.join(' '));
const ngBuildProcess = spawnSync('node', nodeArgs, {stdio: 'inherit', shell: true});

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
