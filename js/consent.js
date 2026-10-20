// Baner zgody na cookies. Google Analytics i Piksel Meta ładują się dopiero po zgodzie.
(function () {
  var GA_ID = 'G-PL5HDHTKPF';
  var PIXEL_ID = '863323126814294';
  var KEY = 'ametyst_consent';
  var VERSION = 1;

  function readConsent() {
    try {
      var c = JSON.parse(localStorage.getItem(KEY));
      return c && c.v === VERSION ? c : null;
    } catch (e) {
      return null;
    }
  }

  function saveConsent(analytics, marketing) {
    var prev = readConsent();
    var c = { v: VERSION, analytics: analytics, marketing: marketing, ts: new Date().toISOString() };
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch (e) {}
    // Wycofanie wcześniej udzielonej zgody – usuwamy cookies i przeładowujemy stronę,
    // żeby wczytane już skrypty przestały działać.
    if (prev && ((prev.analytics && !analytics) || (prev.marketing && !marketing))) {
      clearCookies(prev.analytics && !analytics, prev.marketing && !marketing);
      location.reload();
      return;
    }
    apply(c);
  }

  function clearCookies(ga, fb) {
    document.cookie.split(';').forEach(function (part) {
      var name = part.split('=')[0].trim();
      if ((ga && /^_ga/.test(name)) || (fb && /^_fb/.test(name))) {
        var host = location.hostname.replace(/^www\./, '');
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  }

  var gaLoaded = false;
  var pixelLoaded = false;

  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  function loadPixel() {
    if (pixelLoaded) return;
    pixelLoaded = true;
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function apply(c) {
    if (c.analytics) loadGA();
    if (c.marketing) loadPixel();
    hideBanner();
  }

  var banner;

  function buildBanner() {
    banner = document.createElement('div');
    banner.className = 'consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Ustawienia plików cookies');
    banner.innerHTML =
      '<div class="consent-inner">' +
        '<p class="consent-title">Pliki cookies</p>' +
        '<p class="consent-text">Używamy plików cookies, aby sprawdzać, jak korzystasz ze strony (Google Analytics), oraz mierzyć skuteczność naszych reklam na Facebooku i Instagramie (Piksel Meta). Włączymy je tylko za Twoją zgodą. Więcej w <a href="polityka-prywatnosci.html">polityce prywatności</a>.</p>' +
        '<div class="consent-options" hidden>' +
          '<label><input type="checkbox" checked disabled> Niezbędne – zapamiętanie Twojego wyboru</label>' +
          '<label><input type="checkbox" data-consent="analytics"> Analityczne – Google Analytics</label>' +
          '<label><input type="checkbox" data-consent="marketing"> Marketingowe – Piksel Meta</label>' +
        '</div>' +
        '<div class="consent-actions">' +
          '<button type="button" class="btn btn-ghost" data-action="reject">Odrzucam</button>' +
          '<button type="button" class="btn btn-ghost" data-action="settings">Ustawienia</button>' +
          '<button type="button" class="btn btn-ghost" data-action="save" hidden>Zapisz wybór</button>' +
          '<button type="button" class="btn btn-primary" data-action="accept">Akceptuję wszystkie</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(banner);

    banner.addEventListener('click', function (e) {
      var action = e.target.getAttribute('data-action');
      if (!action) return;
      if (action === 'accept') saveConsent(true, true);
      if (action === 'reject') saveConsent(false, false);
      if (action === 'settings') showSettings();
      if (action === 'save') {
        saveConsent(
          banner.querySelector('[data-consent="analytics"]').checked,
          banner.querySelector('[data-consent="marketing"]').checked
        );
      }
    });
  }

  function showSettings() {
    var c = readConsent();
    banner.querySelector('[data-consent="analytics"]').checked = !!(c && c.analytics);
    banner.querySelector('[data-consent="marketing"]').checked = !!(c && c.marketing);
    banner.querySelector('.consent-options').hidden = false;
    banner.querySelector('[data-action="settings"]').hidden = true;
    banner.querySelector('[data-action="save"]').hidden = false;
  }

  function showBanner(withSettings) {
    if (!banner) buildBanner();
    banner.hidden = false;
    if (withSettings) showSettings();
  }

  function hideBanner() {
    if (banner) banner.hidden = true;
  }

  document.addEventListener('DOMContentLoaded', function () {
    var c = readConsent();
    if (c) apply(c);
    else showBanner(false);

    document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        showBanner(true);
      });
    });
  });
})();
