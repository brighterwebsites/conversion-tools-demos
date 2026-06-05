/**
 * BNB Property Tools — Calculator Logic
 *
 * Tools:
 *   bnbCalcAnnualRevenue()  — button-triggered, Annual Revenue Estimator
 *   bnbCalcNetRevenue()     — button-triggered, Per-Booking Net Revenue Estimator
 *   Lead Gap Calculator     — live/real-time, initialised via bnbInitLeadGap()
 *
 * No external dependencies. Safe to load in footer (true in wp_enqueue_script).
 * Assets are only enqueued on pages that contain a plugin shortcode.
 */

(function () {
  'use strict';

  /* ── Shared helpers ──────────────────────────────────────── */

  function fmt(n) {
    return '$' + n.toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtRound(n) {
    return '$' + Math.round(n).toLocaleString('en-AU');
  }

  function pct(n) {
    return n.toFixed(1) + '%';
  }

  function numVal(id) {
    var el = document.getElementById(id);
    if (!el || el.value === '') return null;
    var v = parseFloat(el.value);
    return isNaN(v) ? null : v;
  }

  function show(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = '';
  }

  function hide(id) {
    var el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  function set(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  /* ── Annual Revenue ──────────────────────────────────────── */

  window.bnbCalcAnnualRevenue = function () {
    var occupancy = numVal('bnb-occupancy');
    var dailyRate = numVal('bnb-daily-rate');
    if (occupancy === null || dailyRate === null) return;

    var revenue = (occupancy / 100) * dailyRate * 365;
    set('bnb-annual-value', fmt(revenue));
    show('bnb-annual-result');
  };

  /* ── Net Revenue (per booking) ───────────────────────────── */

  window.bnbCalcNetRevenue = function () {
    var nightlyRate = numVal('bnb-nightly-rate');
    var nights      = numVal('bnb-nights');
    var guests      = numVal('bnb-guests');
    var beds        = numVal('bnb-beds');
    var bedrooms    = numVal('bnb-bedrooms');
    var bathrooms   = numVal('bnb-bathrooms');
    var living      = numVal('bnb-living');
    var kitchens    = numVal('bnb-kitchens');
    var mgmtRate    = numVal('bnb-mgmt-rate');

    if ([nightlyRate, nights, guests, beds, bedrooms, bathrooms, living, kitchens, mgmtRate].indexOf(null) !== -1) return;

    var guestFee   = nightlyRate * nights;
    var cleaning   = (beds * 5) + (bedrooms * 20) + (bathrooms * 20) + (living * 20) + (kitchens * 30);
    var linen      = (beds * 27) + (guests * 4) + (bathrooms * 4.5) + (kitchens * 4.2);
    var management = guestFee * (mgmtRate / 100);
    var commission = guestFee * 0.17;
    var owner      = guestFee - cleaning - linen - management - commission;
    var ownerPct   = guestFee > 0 ? (owner / guestFee) * 100 : 0;

    set('bnb-res-guest-fee',  fmt(guestFee));
    set('bnb-res-cleaning',   fmt(cleaning));
    set('bnb-res-linen',      fmt(linen));
    set('bnb-res-mgmt',       fmt(management));
    set('bnb-res-commission', fmt(commission));
    set('bnb-res-owner',      fmt(owner));
    set('bnb-res-pct',        pct(ownerPct) + ' of the total guest fee');

    show('bnb-net-result');
  };

  /* ── Lead & Revenue Gap Calculator ──────────────────────── */

  function bnbInitLeadGap() {
    var root = document.getElementById('bnb-lead-gap');
    if (!root) return;

    var goalType = 'clients';

    /* goal toggle */
    root.querySelector('#lg-goal-clients').addEventListener('click', function () {
      goalType = 'clients';
      root.querySelector('#lg-goal-clients').classList.add('lg-toggle__btn--active');
      root.querySelector('#lg-goal-revenue').classList.remove('lg-toggle__btn--active');
      root.querySelector('#lg-goal-value-label').textContent = 'How many more clients per month?';
      root.querySelector('#lg-goal-value-wrap').querySelector('input').placeholder = 'e.g. 5';
      var prefix = root.querySelector('#lg-goal-value-wrap .bnb-tool__unit--prefix');
      if (prefix) prefix.style.display = 'none';
      bnbUpdateLeadGap();
    });

    root.querySelector('#lg-goal-revenue').addEventListener('click', function () {
      goalType = 'revenue';
      root.querySelector('#lg-goal-revenue').classList.add('lg-toggle__btn--active');
      root.querySelector('#lg-goal-clients').classList.remove('lg-toggle__btn--active');
      root.querySelector('#lg-goal-value-label').textContent = 'How much more revenue per month? ($)';
      root.querySelector('#lg-goal-value-wrap').querySelector('input').placeholder = 'e.g. 10000';
      var prefix = root.querySelector('#lg-goal-value-wrap .bnb-tool__unit--prefix');
      if (prefix) prefix.style.display = '';
      bnbUpdateLeadGap();
    });

    /* live update on all number inputs */
    root.querySelectorAll('input[type="number"]').forEach(function (el) {
      el.addEventListener('input', bnbUpdateLeadGap);
    });

    function bnbUpdateLeadGap() {
      var leads    = numVal('lg-monthly-leads');
      var closed   = numVal('lg-monthly-closed');
      var avgSale  = numVal('lg-avg-sale');
      var goalVal  = numVal('lg-goal-value');
      var errEl    = root.querySelector('#lg-closed-error');

      /* clear previous inline error */
      errEl.textContent = '';

      /* incomplete — show placeholder */
      if (leads === null || closed === null || avgSale === null || goalVal === null ||
          leads < 1 || avgSale < 1 || goalVal < 1) {
        showState('placeholder');
        return;
      }

      /* closed > leads — inline error */
      if (closed > leads) {
        errEl.textContent = 'Closed sales can\'t exceed total leads.';
        showState('placeholder');
        return;
      }

      /* zero closes — can't compute rate */
      if (closed === 0) {
        errEl.textContent = 'No closes recorded — close rate cannot be calculated.';
        showState('placeholder');
        return;
      }

      var closeRate          = closed / leads;
      var currentMonthlyRev  = closed * avgSale;

      var extraLeadsNeeded, extraRevenuePerMonth, targetClosed;

      if (goalType === 'clients') {
        targetClosed       = closed + goalVal;
        var targetLeads    = Math.ceil(targetClosed / closeRate);
        extraLeadsNeeded   = targetLeads - leads;
        extraRevenuePerMonth = goalVal * avgSale;
      } else {
        var extraSales     = Math.ceil(goalVal / avgSale);
        targetClosed       = closed + extraSales;
        var targetLeads2   = Math.ceil(targetClosed / closeRate);
        extraLeadsNeeded   = targetLeads2 - leads;
        extraRevenuePerMonth = goalVal;
      }

      /* already hitting goal */
      if (extraLeadsNeeded <= 0) {
        showState('hitting');
        return;
      }

      var annualGap       = extraRevenuePerMonth * 12;
      var totalLeads      = leads + extraLeadsNeeded;
      var closeRatePct    = (closeRate * 100).toFixed(1) + '%';
      var oneIn           = Math.round(1 / closeRate);

      set('lg-res-close-rate',   closeRatePct);
      set('lg-res-close-plain',  'You close 1 in ' + oneIn + ' leads');
      set('lg-res-monthly-rev',  fmtRound(currentMonthlyRev) + '/month');
      set('lg-res-extra-leads',  '+' + extraLeadsNeeded + ' leads/month');
      set('lg-res-total-leads',  totalLeads + ' leads/month total');
      set('lg-res-annual-gap',   fmtRound(annualGap));

      showState('results');
    }

    function showState(state) {
      hide('lg-placeholder');
      hide('lg-results');
      hide('lg-hitting');
      if (state === 'placeholder') show('lg-placeholder');
      else if (state === 'results') show('lg-results');
      else if (state === 'hitting') show('lg-hitting');
    }
  }

  /* ── Boot ────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bnbInitLeadGap);
  } else {
    bnbInitLeadGap();
  }

})();
