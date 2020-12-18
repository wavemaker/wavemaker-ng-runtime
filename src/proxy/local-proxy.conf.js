const PROXY_CONFIG = [
    {
        context: [
            "/ng-bundle/services",
            "/ng-bundle/resources",
            "/ng-bundle/favicon.png",
            "/ng-bundle/print.css"
        ],
        "target": "<proxy-url>",
        "pathRewrite": {
            "^/ng-bundle/": "/"
        },
        "secure": false,
        "changeOrigin": true,
        "logLevel": "debug"
    }
]

module.exports = PROXY_CONFIG;