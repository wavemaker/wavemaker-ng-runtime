window.SPOTCUES_UTILS = {
    getCordovaScriptBaseUrl: function getCordovaScriptBaseUrl() {
        var basePath = 'https://d2qztbtcmhe1gf.cloudfront.net/micro-apps/7329884/';
        var spotcuesUtilsScript = document.querySelector('#spotcues-utils-script');
        basePath = ((spotcuesUtilsScript || {}).dataset || {}).cordovaScriptBaseUrl || basePath;
        return basePath;
    },
    getMobileOperatingSystem: function getMobileOperatingSystem() {
        var userAgent = navigator.userAgent || navigator.vendor || window.opera;
        if (/android/i.test(userAgent)) {
            return 'android';
        }
        if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
            return 'ios';
        }
        return '';
    },
    loadScript: function loadScript(url, callback) {
        // Adding the script tag to the head as suggested before
        var head = document.getElementsByTagName('head')[0];
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;

        // Then bind the event to the callback function.
        // There are several events for cross browser compatibility.
        script.onreadystatechange = callback;
        script.onload = callback;

        // Fire the loading
        head.appendChild(script);
    },
    loadCordova: function loadCordova(callback) {
        var AppListManager = window.AppListManager;
        var os = this.getMobileOperatingSystem();
        if (AppListManager) {
            callback && callback()
            return;
        }
        if (window.location.host) {
            if (os === 'android' || os === 'ios') {
                window.prePendPath = this.getCordovaScriptBaseUrl();
                var isWkWebview = location.search.indexOf('wkwebview=true') !== -1;
                var scriptPath = window.prePendPath + 'cordova/cordova_'+ os;
                if (isWkWebview) {
                    scriptPath = scriptPath + '_wk.min.js';
                } else  {
                    scriptPath = scriptPath + '.min.js';
                }
                this.loadScript(scriptPath, function() {
                    console.log('loading cordva.....');
                    callback && callback();
                });
            }
        } else {
            this.loadScript('../../cordova/cordova.js', function() {
                console.log('loading cordva.....');
                callback && callback();
            });
        }
    },
}
