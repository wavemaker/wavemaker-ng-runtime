const { spawnSync } = require('child_process');

const args = process.argv.slice(2);

const ngBuildArgs = ['build', ...args];
console.log("Build params - ", ngBuildArgs);

//Trigger angular build with the passed params
const ngBuildProcess = spawnSync('./node_modules/.bin/ng', ngBuildArgs, { stdio: 'inherit' });

if (ngBuildProcess.status === 0) {
    console.log('ng build completed successfully!');
} else {
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
