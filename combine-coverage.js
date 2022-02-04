const createReporter = require('istanbul-api').createReporter;
const istanbulCoverage = require('istanbul-lib-coverage');
const fs = require("fs")
var glob = require("glob");
var summary = istanbulCoverage.createCoverageSummary();

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
        if (totalSummary[index].indexOf('tests completed') >= 0 || totalSummary[index].indexOf('test completed') >= 0) {
            totalTestCompleted = totalTestCompleted + numbeTest;
        } else if (totalSummary[index].indexOf('tests skipped') >= 0 || totalSummary[index].indexOf('test skipped') >= 0) {
            totalTestSkipped = totalTestSkipped + numbeTest;
        } else if (totalSummary[index].indexOf('tests slow') >= 0 || totalSummary[index].indexOf('test slow') >= 0) {
            totalTestSlowed = totalTestSlowed + numbeTest;
        } else if (totalSummary[index].indexOf('tests failed') >= 0 || totalSummary[index].indexOf('test failed') >= 0) {
            totalTestsFailed = totalTestsFailed + numbeTest;
        }

    }
    console.log("=============================== Overall Test Summary ===========================");


    console.log("Tests completed : " + totalTestCompleted);
    console.log("Tests failed : " + totalTestsFailed);
    console.log("Tests skipped : " + totalTestSkipped);

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







