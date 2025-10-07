module.exports = {
    "/services": {
        target: "https://<your-deployed-app-url>/",
        secure: true,
        changeOrigin: true
    },
    "/j_spring_security_check": {
        target: "https://<your-deployed-app-url>/",
        secure: true,
        changeOrigin: true,
        cookiePathRewrite: "/",
        cookieDomainRewrite: "localhost"
    }
};
