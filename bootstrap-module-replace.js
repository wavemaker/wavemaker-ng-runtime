
var fs = require('fs');
const fileLocation = './dist/tmp/libs/ngx-bootstrap/ngx-bootstrap.umd.js'
// Read the concatinated umd bootstrap JS fiile and strore it in a memory
var content = fs.readFileSync(fileLocation, 'utf8');
// Wrap the content into the IIF function with ngx-bootstrap context
// To fix the issue: https://github.com/valor-software/ngx-bootstrap/issues/5609
fs.writeFileSync(fileLocation, '(function(bsRef){ \n', 'utf8');

// Content: Split into the lines
content.split(/\r?\n/).forEach(function (line) {

    if (line.indexOf("global['ngx-bootstrap'] || {}") >= 0) {
        let editedLIne = line;
        // Changing the component-loader property to camel case;
        if (editedLIne.indexOf("global['ngx-bootstrap']['component-loader'] = {}") >= 0) {
            editedLIne = editedLIne.replace("global['ngx-bootstrap']['component-loader'] = {}", "global['ngx-bootstrap']['componentLoader'] = {}");
        }
        // Changing the mini-ngrx property to camel case;
        if (editedLIne.indexOf("global['ngx-bootstrap']['mini-ngrx'] = {}") >= 0) {
            editedLIne = editedLIne.replace("global['ngx-bootstrap']['mini-ngrx'] = {}", "global['ngx-bootstrap']['miniNgrx'] = {}");
        }
        // Assign the global to ngx-bootstrap as we are passing the context.
        fs.appendFileSync(fileLocation, editedLIne.replace("global['ngx-bootstrap'] || {}", "global['ngx-bootstrap'] || global"));

    } else {
        fs.appendFileSync(fileLocation, line);
    }
    fs.appendFileSync(fileLocation, '\n');
});
// Wrapping function ends here
fs.appendFileSync(fileLocation, '})(window["ngx-bootstrap"]) \n');




