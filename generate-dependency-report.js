const checker = require('license-checker');
const fs = require('fs');
const path = require('path');

// HTML template as a string
const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Angular Dependencies Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            color: #333;
        }
        .header {
            background: #f4f4f4;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .section {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: #f8f8f8;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        tr:hover {
            background-color: #f5f5f5;
        }
        .dependency-type {
            font-size: 1.2em;
            color: #666;
            font-weight: bold;
            margin: 20px 0 10px;
            padding-bottom: 5px;
            border-bottom: 2px solid #eee;
        }
        .transitive {
            margin-left: 20px;
            border-left: 3px solid #eee;
            padding-left: 20px;
        }
        .license-count {
            font-weight: bold;
            color: #2196F3;
        }
        .timestamp {
            color: #666;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Angular Project Dependencies Report</h1>
        <p class="timestamp">Generated on: {{GENERATED_DATE}}</p>
    </div>

    <div class="section">
        <h2>Project Dependencies Overview</h2>
        {{PRODUCTION_DEPENDENCIES}}
        {{DEVELOPMENT_DEPENDENCIES}}
    </div>

    <div class="section">
        <h2>Transitive Dependencies</h2>
        {{TRANSITIVE_DEPENDENCIES}}
    </div>

    <div class="section">
        <h2>License Summary</h2>
        {{LICENSE_SUMMARY}}
    </div>
</body>
</html>
`;

// Main function to generate the report
function generateDependencyReport() {
    checker.init({
        start: './',
        json: true,
        customPath: {
            licenses: true,
            dependencies: true,
            version: true
        }
    }, function(err, packages) {
        if (err) {
            console.error("Error:", err);
            return;
        }

        const projectData = processPackages(packages);
        const html = generateHTML(projectData);

        // Write the report to a file
        fs.writeFileSync('dependency-report.html', html);
        console.log('Dependency report generated successfully!');
    });
}

// Process the packages data
function processPackages(packages) {
    const data = {
        production: {},
        development: {},
        transitive: {},
        licenses: {}
    };

    // Read package.json to determine prod vs dev dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const prodDeps = packageJson.dependencies || {};
    const devDeps = packageJson.devDependencies || {};

    Object.entries(packages).forEach(([pkgName, info]) => {
        const name = pkgName.split('@')[0];
        const version = pkgName.split('@')[1];
        const packageInfo = {
            version,
            license: info.licenses,
            description: info.description || '',
            repository: info.repository || '',
            publisher: info.publisher || ''
        };

        // Track license information
        if (info.licenses) {
            if (!data.licenses[info.licenses]) {
                data.licenses[info.licenses] = {
                    count: 0,
                    packages: []
                };
            }
            data.licenses[info.licenses].count++;
            data.licenses[info.licenses].packages.push(name);
        }

        // Categorize dependencies
        if (prodDeps[name]) {
            data.production[name] = packageInfo;
        } else if (devDeps[name]) {
            data.development[name] = packageInfo;
        } else {
            data.transitive[name] = packageInfo;
        }
    });

    return data;
}

// Generate HTML tables for dependencies
function generateDependencyTable(dependencies, title) {
    if (Object.keys(dependencies).length === 0) return '';

    return `
        <div class="dependency-type">${title}</div>
        <table>
            <tr>
                <th>Package</th>
                <th>Version</th>
                <th>License</th>
                <th>Repository</th>
            </tr>
            ${Object.entries(dependencies)
        .map(([name, info]) => `
                    <tr>
                        <td>${name}</td>
                        <td>${info.version}</td>
                        <td>${info.license || 'Unknown'}</td>
                        <td>${info.repository || 'N/A'}</td>
                    </tr>
                `).join('')}
        </table>
    `;
}

// Generate license summary table
function generateLicenseSummary(licenses) {
    return `
        <table>
            <tr>
                <th>License</th>
                <th>Count</th>
                <th>Packages</th>
            </tr>
            ${Object.entries(licenses)
        .map(([license, info]) => `
                    <tr>
                        <td>${license}</td>
                        <td class="license-count">${info.count}</td>
                        <td>${info.packages.join(', ')}</td>
                    </tr>
                `).join('')}
        </table>
    `;
}

// Generate the final HTML
function generateHTML(data) {
    let html = htmlTemplate;

    // Replace placeholders with actual content
    html = html.replace('{{GENERATED_DATE}}', new Date().toLocaleString());
    html = html.replace('{{PRODUCTION_DEPENDENCIES}}',
        generateDependencyTable(data.production, 'Production Dependencies'));
    html = html.replace('{{DEVELOPMENT_DEPENDENCIES}}',
        generateDependencyTable(data.development, 'Development Dependencies'));
    html = html.replace('{{TRANSITIVE_DEPENDENCIES}}',
        generateDependencyTable(data.transitive, 'Transitive Dependencies'));
    html = html.replace('{{LICENSE_SUMMARY}}',
        generateLicenseSummary(data.licenses));

    return html;
}

// Run the report generation
generateDependencyReport();
