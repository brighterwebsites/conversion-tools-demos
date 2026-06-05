/* BNB Property Tools — Calculator Logic */

(function () {
  'use strict';

  function fmt(n) {
    return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function pct(n) {
    return n.toFixed(1) + '%';
  }

  function val(id, fallback) {
    var el = document.getElementById(id);
    if (!el) return fallback;
    var v = parseFloat(el.value);
    return isNaN(v) ? fallback : v;
  }

  function show(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = '';
  }

  function set(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // ── Annual Revenue ──────────────────────────────────────────
  window.bnbCalcAnnualRevenue = function () {
    var occupancy  = val('bnb-occupancy', 48);
    var dailyRate  = val('bnb-daily-rate', 365);
    var revenue    = (occupancy / 100) * dailyRate * 365;

    set('bnb-annual-value', fmt(revenue));
    show('bnb-annual-result');
  };

  // ── Net Revenue (per booking) ───────────────────────────────
  window.bnbCalcNetRevenue = function () {
    var nightlyRate  = val('bnb-nightly-rate', 550);
    var nights       = val('bnb-nights', 2);
    var guests       = val('bnb-guests', 4);
    var beds         = val('bnb-beds', 2);
    var bedrooms     = val('bnb-bedrooms', 2);
    var bathrooms    = val('bnb-bathrooms', 2);
    var living       = val('bnb-living', 1);
    var kitchens     = val('bnb-kitchens', 1);
    var mgmtRate     = val('bnb-mgmt-rate', 20) / 100;

    var guestFee     = nightlyRate * nights;
    var cleaning     = (beds * 5) + (bedrooms * 20) + (bathrooms * 20) + (living * 20) + (kitchens * 30);
    var linen        = (beds * 27) + (guests * 4) + (bathrooms * 4.5) + (kitchens * 4.2);
    var management   = guestFee * mgmtRate;
    var commission   = guestFee * 0.17;
    var owner        = guestFee - cleaning - linen - management - commission;
    var ownerPct     = guestFee > 0 ? (owner / guestFee) * 100 : 0;

    set('bnb-res-guest-fee',  fmt(guestFee));
    set('bnb-res-cleaning',   fmt(cleaning));
    set('bnb-res-linen',      fmt(linen));
    set('bnb-res-mgmt',       fmt(management));
    set('bnb-res-commission', fmt(commission));
    set('bnb-res-owner',      fmt(owner));
    set('bnb-res-pct',        pct(ownerPct) + ' of the total guest fee');

    show('bnb-net-result');
  };
})();
