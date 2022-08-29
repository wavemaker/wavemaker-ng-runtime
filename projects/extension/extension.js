if (navigator.userAgent.indexOf("Chrome") !== -1 && !!window.chrome) {

    const style = [
                "font-family: robotoregular, Arial"
            ],
            font18 = [
                "font-size: 18px",
                "line-height: 35px"
            ],
            font40 = [
                "font-size: 40px",
                "line-height: 50px"
            ],
            highLightStyle = [
                "color: #1068cc",
                "-webkit-text-stroke: 1px #187eeb"
            ],
            headerStyle           = [...style, ...font40, ...highLightStyle].join("; "),
            installationTextStyle = [...style, ...font18].join("; "),
            tabStyle              = [...style, ...font18, ...highLightStyle].join("; ");

    console.log("\n%cWaveMaker Devtool\n%cFor ease of testing and debugging WaveMaker applications use WaveMaker native Chrome developer tool called %cWaveMaker Devtool%c (https://chrome.google.com/webstore/detail/wavemaker-devtool/niakeolhkmomhekokhdbfiaebkganjnk).\nIf installed, start using it by switching to the %cWaveMaker %ctab in the Developer Tools. Trust us it's smarter than what you use now.\n", headerStyle, installationTextStyle, tabStyle, installationTextStyle, tabStyle, installationTextStyle);
}
