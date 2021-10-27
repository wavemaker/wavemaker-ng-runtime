importScripts("./ngsw-worker.js");

(function () {
  "use strict";

  self.addEventListener("notificationclick", (event) => {
    const notificationUrl = event.notification.data?.url;
    event.notification.close();
    // Enumerate windows, and call window.focus(), or open a new one.
    event.waitUntil(
      clients.matchAll().then((matchedClients) => {
        for (let client of matchedClients) {
          if (!notificationUrl) {
            return client.focus();
          }
          if (client.url === notificationUrl) {
            return client.focus();
          }
        }
        return clients.openWindow(notificationUrl);
      })
    );
  });
})();
