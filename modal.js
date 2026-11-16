/* Popup kustom pengganti confirm()/alert() bawaan browser. */
(function (global) {
  'use strict';
  var overlay = null, currentResolve = null;

  function ensure() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.className = 'rsl-modal-overlay';
    overlay.innerHTML =
      '<div class="rsl-modal" role="dialog" aria-modal="true">' +
      '<div class="rsl-modal-icon">!</div>' +
      '<h3></h3><p></p>' +
      '<div class="rsl-modal-actions"></div>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close(false);
    });
    document.addEventListener('keydown', function (e) {
      if (overlay.classList.contains('show') && e.key === 'Escape') close(false);
    });
    return overlay;
  }

  function close(value) {
    if (!overlay || !overlay.classList.contains('show')) return;
    overlay.classList.remove('show');
    var resolve = currentResolve;
    currentResolve = null;
    if (resolve) resolve(value);
  }

  function open(opts) {
    var el = ensure();
    var box = el.querySelector('.rsl-modal');
    var icon = el.querySelector('.rsl-modal-icon');
    var title = el.querySelector('h3');
    var msg = el.querySelector('p');
    var actions = el.querySelector('.rsl-modal-actions');

    box.className = 'rsl-modal' + (opts.danger ? ' danger' : '');
    icon.textContent = opts.icon || (opts.danger ? '⚠' : 'i');
    title.textContent = opts.title || 'Perhatian';
    msg.textContent = opts.message || '';
    actions.innerHTML = '';

    var cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = opts.cancelText || 'Batal';
    cancel.addEventListener('click', function () { close(false); });
    actions.appendChild(cancel);

    var ok = document.createElement('button');
    ok.type = 'button';
    ok.textContent = opts.okText || 'Oke';
    ok.className = opts.danger ? 'danger' : 'primary';
    ok.addEventListener('click', function () { close(true); });
    actions.appendChild(ok);

    if (opts.hideCancel) cancel.style.display = 'none';
    currentResolve = null;
    el.classList.add('show');
    setTimeout(function () { (opts.hideCancel ? ok : cancel).focus(); }, 30);

    return new Promise(function (resolve) { currentResolve = resolve; });
  }

  global.RSLModal = {
    confirm: function (opts) {
      if (typeof opts === 'string') opts = { message: opts };
      return open(opts);
    },
    alert: function (opts) {
      if (typeof opts === 'string') opts = { message: opts };
      opts.hideCancel = true;
      return open(opts);
    }
  };
})(window);
