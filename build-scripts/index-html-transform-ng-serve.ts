import {TargetOptions} from '@angular-builders/custom-webpack';

export default function indexHtmlTransformNgServe(
    targetOptions: TargetOptions,
    indexHtml: string
): string {
    const deployUrl = 'ng-bundle/';
    const wmStylesHref = `${deployUrl}wm-styles.css`;

    const metaDeployUrl = `<meta name="deployUrl" content="${deployUrl}">`;
    const linkWmStyles = `<link rel="stylesheet" type="text/css" href="${wmStylesHref}">`;

    const injectHtml = `${metaDeployUrl}
                        ${linkWmStyles}`;
    const headCloseIndex = indexHtml.indexOf('</head>');

    return `${indexHtml.slice(0, headCloseIndex)}
            ${injectHtml}
            ${indexHtml.slice(headCloseIndex)}`;
}
