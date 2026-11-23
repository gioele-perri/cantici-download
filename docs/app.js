"use strict";
(function () {
  var config = window.CANTICI_DOWNLOAD;
  var button = document.getElementById("download");
  var release = document.getElementById("release");
  if (!config || !/^[A-Za-z0-9-]+\/[A-Za-z0-9_.-]+$/.test(config.repository)) return;
  var prefix = "https://github.com/" + config.repository + "/releases/";
  button.href = prefix + "latest/download/Cantici.apk";
  document.getElementById("qr").hidden = !config.hasQr;
  button.addEventListener("click", function () {
    document.getElementById("download-help").hidden = false;
  });
  var abort = new AbortController();
  var timeout = setTimeout(function () { abort.abort(); }, 10000);
  fetch("latest.json", { cache: "no-store", signal: abort.signal })
    .then(function (response) {
      if (!response.ok) throw new Error("manifest unavailable");
      return response.json();
    })
    .then(function (info) {
      if (info.schemaVersion !== 1 || info.packageName !== "it.missionecerenzia.cantici" ||
          !Number.isInteger(info.versionCode) || info.versionCode < 1 ||
          typeof info.versionName !== "string" || info.versionName.length > 80 ||
          !Number.isInteger(info.sizeBytes) || info.sizeBytes < 4 ||
          typeof info.apkUrl !== "string" || !info.apkUrl.startsWith(prefix + "download/") ||
          !/^[a-f0-9]{64}$/i.test(info.sha256)) throw new Error("invalid manifest");
      // Keep the stable latest-release link for browsers: an old cached page
      // must not send users to an obsolete APK. The app uses the pinned URL.
      release.textContent = "Versione " + info.versionName + " · " +
        Math.ceil(info.sizeBytes / 1048576) + " MB · Android";
    })
    .catch(function () {
      release.textContent = "Il pulsante scarica l’ultima versione pubblicata.";
    })
    .finally(function () { clearTimeout(timeout); });
}());
