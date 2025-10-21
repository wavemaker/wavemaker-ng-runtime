import * as fs from 'fs';
import * as path from 'path';
import {environment} from '../src/environments/environment.prod';

const validScript = (path: string, indexHtml: string): boolean => {
    return !indexHtml.includes(path);
};

const getScriptTag = (path: string): string => {
    return `<script src="ng-bundle/${path}"></script>`;
};

const injectVendorScripts = (targetOptions: any, indexHtml: string): string => {
    const vendor_path: string = path.resolve(__dirname + `/../dist/ng-bundle`);
    let vendorScripts: string = ``;

    fs.readdirSync(vendor_path).forEach((file: string) => {
        if (file.indexOf('vendor-') === 0) {
            if (!file.includes('.br.js') && !file.includes('.gzip.js') && validScript(file, indexHtml)) {
                vendorScripts += getScriptTag(file);
            }
        }
    });

    const headEndIndex: number = indexHtml.indexOf('</head>');
    if (headEndIndex !== -1 && environment?.apiUrl) {
        indexHtml = `${indexHtml.slice(0, headEndIndex)}<meta name="apiUrl" content="${environment.apiUrl}" />\n${indexHtml.slice(headEndIndex)}`;
    }

    const mainScriptStr: string = `<script src="ng-bundle/main`;
    const newMainIndex: number = indexHtml.indexOf(mainScriptStr);

    if (newMainIndex !== -1) {
        return `${indexHtml.slice(0, newMainIndex)}
            ${vendorScripts}
            ${indexHtml.slice(newMainIndex)}`;
    } else {
        return indexHtml;
    }
};

export default injectVendorScripts;
