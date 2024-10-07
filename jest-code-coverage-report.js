var fs = require('fs');
var path = require('path');

function combineHtmlAndCss(htmlPath, cssFiles, outputPath) {
    fs.readFile(htmlPath, 'utf-8', function (err, htmlContent) {
        if (err) {
            console.error('Error reading HTML file:', err);
            return;
        }

        var cssContents = [];
        var cssFilesProcessed = 0;

        cssFiles.forEach(function (cssPath) {
            fs.readFile(cssPath, 'utf-8', function (err, content) {
                if (err) {
                    console.error('Error reading CSS file:', err);
                    return;
                }
                cssContents.push(content);
                cssFilesProcessed++;

                if (cssFilesProcessed === cssFiles.length) {
                    // All CSS files have been read, proceed with combining
                    var combinedCss = '<style>' + cssContents.join('\n') + '</style>';

                    // Insert combined CSS into HTML
                    var finalHtmlContent = htmlContent.replace('</head>', combinedCss + '\n</head>');

                    // Write the combined HTML to a new file
                    fs.writeFile(outputPath, finalHtmlContent, 'utf-8', function (err) {
                        if (err) {
                            console.error('Error writing output file:', err);
                        } else {
                            console.log('HTML and CSS combined successfully!');
                            console.log('Output file: ' + outputPath);
                        }
                    });
                }
            });
        });
    });
}

// Usage
var htmlPath = path.join(__dirname, 'coverage', 'index.html');
var cssFiles = [
    path.join(__dirname, 'coverage', 'base.css'),
    path.join(__dirname, 'coverage', 'prettify.css')
];
var outputPath = path.join(__dirname, 'jest-code-coverage-report.html');

combineHtmlAndCss(htmlPath, cssFiles, outputPath);