// ── Nav Clock (date + time) ─────────────────────
(function () {
  var DAYS   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function updateClock() {
    var el = document.getElementById('nav-clock');
    if (!el) return;
    var now = new Date();
    var day  = DAYS[now.getDay()];
    var date = now.getDate();
    var mon  = MONTHS[now.getMonth()];
    var yr   = now.getFullYear();
    var h    = String(now.getHours()).padStart(2, '0');
    var m    = String(now.getMinutes()).padStart(2, '0');
    var s    = String(now.getSeconds()).padStart(2, '0');
    el.textContent = day + ', ' + date + ' ' + mon + ' ' + yr + ' · ' + h + ':' + m + ':' + s + ' IST';
  }
  updateClock();
  setInterval(updateClock, 1000);
})();
