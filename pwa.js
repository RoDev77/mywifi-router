/* Pendaftaran service worker + tombol install aplikasi (jika didukung browser). */
(function () {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    });
  }

  var deferred = null;
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    var btn = document.getElementById('installBtn');
    if (btn) {
      btn.style.display = 'grid';
      btn.addEventListener('click', function () {
        if (!deferred) return;
        deferred.prompt();
        deferred.userChoice.then(function () { deferred = null; btn.style.display = 'none'; });
      });
    }
  });

  window.addEventListener('appinstalled', function () {
    var btn = document.getElementById('installBtn');
    if (btn) btn.style.display = 'none';
  });
})();
