/* style-src compliance check — EUD-3489.
   External file so it passes script-src 'self' without a nonce.
   Loaded in <head> BEFORE the Cookiebot script, so the violation listener
   is registered before the banner can render. */

window.__style = [];

document.addEventListener('securitypolicyviolation', function (e) {
  var dir = e.effectiveDirective || e.violatedDirective || '';
  if (dir.indexOf('style') === 0) {
    window.__style.push({
      dir: dir,
      what: e.sample || e.blockedURI || 'inline',
      src: (e.sourceFile || '') + (e.lineNumber ? ':' + e.lineNumber : '')
    });
    refresh();
  }
});

function refresh() {
  var verdict = document.getElementById('verdict');
  var log = document.getElementById('log');
  if (!verdict || !log) return; // DOM not parsed yet

  var v = window.__style;
  var rendered = !!document.getElementById('CybotCookiebotDialog');

  log.textContent = '';
  v.forEach(function (row) {
    var li = document.createElement('li');
    li.textContent = row.dir + ' — ' + row.what + (row.src ? '  (' + row.src + ')' : '');
    log.appendChild(li);
  });

  if (v.length > 0) {
    verdict.className = 'verdict fail';
    verdict.textContent = 'FAIL — ' + v.length + ' style-src violation' + (v.length === 1 ? '' : 's');
  } else if (rendered) {
    verdict.className = 'verdict pass';
    verdict.textContent = 'PASS — banner rendered, 0 style-src violations';
  } else {
    verdict.className = 'verdict idle';
    verdict.textContent = 'Banner not rendered yet — open / renew it.';
  }
}

function renew() {
  if (window.Cookiebot && Cookiebot.renew) Cookiebot.renew();
  else if (window.Cookiebot && Cookiebot.show) Cookiebot.show();
  setTimeout(refresh, 250);
}

document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('renew').addEventListener('click', renew);
  document.getElementById('reset').addEventListener('click', function () {
    document.cookie = 'CookieConsent=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
    renew();
  });
  refresh();
});

window.addEventListener('CookiebotOnDialogDisplay', function () { setTimeout(refresh, 80); });
window.addEventListener('CookiebotOnLoad', function () { setTimeout(refresh, 150); });
setInterval(refresh, 1500);
