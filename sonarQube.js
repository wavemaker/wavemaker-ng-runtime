require('sonarqube-scanner').default(
    {
        serverUrl: process.argv[2],
        options: {
            "sonar.login": process.argv[3],
            "sonar.projectKey": process.argv[4],
            "sonar.projectName": process.argv[4],
            "sonar.projectVersion": process.argv[5],
            "sonar.exclusions": "node_modules/**/*, dist/**/*, dependency-check-bin/**, dependency-check-reports/*",
            "sonar.scm.enabled": "false",
            "sonar.dependencyCheck.htmlReportPath": "./dependency-check-reports/dependency-check-report.html",
            "sonar.dependencyCheck.jsonReportPath": "./dependency-check-reports/dependency-check-report.json",
            "sonar.dependencyCheck.xmlReportPath": "./dependency-check-reports/dependency-check-report.xml",
            "sonar.javascript.lcov.reportPaths": "coverage/lcov.info"
        }
    },
    () => {
        // A must callback
    }
);
