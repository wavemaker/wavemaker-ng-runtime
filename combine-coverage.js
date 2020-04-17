const createReporter = require('istanbul-api').createReporter;
const istanbulCoverage = require('istanbul-lib-coverage');
const fs = require("fs")
var glob = require("glob");
var summary = istanbulCoverage.createCoverageSummary();

// Console function registration for colors
/**
 *  info : Green
 *  warn : Yellow
 *  Error : Red
 */
const colorSet = {
    Reset: "\x1b[0m",
    Red: "\x1b[31m",
    Green: "\x1b[32m",
    Yellow: "\x1b[33m",
    Blue: "\x1b[34m",
    Magenta: "\x1b[35m"
};

var funcNames = ["info", "warn", "error"];
var colors = [colorSet.Green,  colorSet.Yellow, colorSet.Red];

for (var i = 0; i < funcNames.length; i++) {
    let funcName = funcNames[i];
    let color = colors[i];
    let oldFunc = console[funcName];
    console[funcName] = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length) {
            args = [color + args[0]].concat(args.slice(1), colorSet.Reset);
        }
        oldFunc.apply(null, args);
    };
}

// Read the text file which has the karma reports from terminal.
// This is we are reading to get the total number of test cases from all the projects;
fs.readFile('./karma-test-report.txt', 'utf-8', (err, file) => {
    const lines = file.split('\n');
    var totalSummary = [];
    var totalTestCompleted = 0;
    var totalTestSkipped = 0;
    var totalTestSlowed = 0;
    var totalTestsFailed = 0;

    while (lines.indexOf("SUMMARY:") >= 0) {
        let summary = lines.splice(lines.indexOf("SUMMARY:"), 5);
        totalSummary = totalSummary.concat(summary);
    }

    for (var index = 0; index < totalSummary.length; index++) {
        var numbeTest = (totalSummary[index] && +totalSummary[index].split(' ').length) ? +totalSummary[index].split(' ')[1] : 0
        if (totalSummary[index].indexOf('tests completed') >= 0) {
            totalTestCompleted = totalTestCompleted + numbeTest;
        } else if (totalSummary[index].indexOf('tests skipped') >= 0) {
            totalTestSkipped = totalTestSkipped + numbeTest;
        } else if (totalSummary[index].indexOf('tests slow') >= 0) {
            totalTestSlowed = totalTestSlowed + numbeTest;
        } else if (totalSummary[index].indexOf('tests failed') >= 0) {
            totalTestsFailed = totalTestsFailed + numbeTest;
        }

    }
    console.log("=============================== Overall Test Summary ===========================");


    console.info("Tests completed : " + totalTestCompleted);
    console.error("Tests failed : " + totalTestsFailed);
    console.warn("Tests skipped : " + totalTestSkipped);

});

// Read the coverage JSON files and merge them with istabbul coverage
glob("./coverage/**/*.json", function (err, files) {
    if (err) {
        console.log("cannot read the folder, something goes wrong with glob", err);
    }
    var jsonCoverage;
    files.forEach(function (file) {
        const reqFile = require(file);
        Object.keys(reqFile).forEach(filename => {
            if (jsonCoverage) {
                let coverMap = istanbulCoverage.createCoverageMap();
                coverMap.addFileCoverage(reqFile[filename])
                jsonCoverage.merge(coverMap);
            } else {
                jsonCoverage = istanbulCoverage.createCoverageMap();
                jsonCoverage.addFileCoverage(reqFile[filename]);
            }
        });
    });

    jsonCoverage.files().forEach(function (f) {
        var fc = jsonCoverage.fileCoverageFor(f),
            s = fc.toSummary();
        summary.merge(s);
    });

    const reporter = createReporter();
    reporter.addAll(['html', 'lcovonly', 'text-summary']);
    reporter.write(jsonCoverage);
    console.log("================================================================================");



});







