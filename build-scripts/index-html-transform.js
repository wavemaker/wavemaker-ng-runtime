
const fs = require('fs');
const node_path = require('path');

const validScript = (path,indexHtml)=>{
    return !indexHtml.includes(path);
}
const getScriptTag = (path)=>{
    return `<script src="ng-bundle/${path}"></script>`
}
module.exports = (targetOptions, indexHtml) =>{
    const vendor_path = node_path.resolve(__dirname+`/../dist/ng-bundle`);
    let vendorScripts = ``;
    fs.readdirSync(vendor_path).forEach((file)=>{
        if(file.indexOf('vendor-')===0){
            if(!file.includes('.br.js') && !file.includes('.gzip.js') && validScript(file,indexHtml)){
                vendorScripts+=getScriptTag(file);
            }
        }
    });

    const mainScriptStr = `<script src="ng-bundle/main`;
    const mainIndex = indexHtml.indexOf(mainScriptStr);
    
    return `${indexHtml.slice(0,mainIndex)}
            ${vendorScripts}
            ${indexHtml.slice(mainIndex)}`;
}