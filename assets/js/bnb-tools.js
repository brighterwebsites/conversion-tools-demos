/**
 * BNB Property Tools — Calculator Logic
 *
 * Tools:
 *   bnbCalcAnnualRevenue()     — Annual Revenue Estimator
 *   bnbCalcNetRevenue()        — Per-Booking Net Revenue Estimator
 *   bnbInitLeadGap()           — Lead & Revenue Gap Calculator (live)
 *   bnbCalcSalesCloser()       — Sales Closer Goals Calculator
 *   bnbInitConversionValue()   — Conversion Value Calculator (live)
 *
 * No external dependencies. Safe to load in footer.
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

  function fmtK(n) {
    if (Math.abs(n) >= 1000000) return '$' + (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'm';
    if (Math.abs(n) >= 1000)    return '$' + (n / 1000).toFixed(0) + 'k';
    return fmtRound(n);
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

  function roundUp10(n) {
    return Math.ceil(n / 10) * 10;
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

    root.querySelectorAll('input[type="number"]').forEach(function (el) {
      el.addEventListener('input', bnbUpdateLeadGap);
    });

    function bnbUpdateLeadGap() {
      var leads    = numVal('lg-monthly-leads');
      var closed   = numVal('lg-monthly-closed');
      var avgSale  = numVal('lg-avg-sale');
      var goalVal  = numVal('lg-goal-value');
      var errEl    = root.querySelector('#lg-closed-error');

      errEl.textContent = '';

      if (leads === null || closed === null || avgSale === null || goalVal === null ||
          leads < 1 || avgSale < 1 || goalVal < 1) {
        showState('placeholder'); return;
      }
      if (closed > leads) {
        errEl.textContent = 'Closed sales can\'t exceed total leads.';
        showState('placeholder'); return;
      }
      if (closed === 0) {
        errEl.textContent = 'No closes recorded — close rate cannot be calculated.';
        showState('placeholder'); return;
      }

      var closeRate         = closed / leads;
      var currentMonthlyRev = closed * avgSale;
      var extraLeadsNeeded, extraRevenuePerMonth, targetClosed;

      if (goalType === 'clients') {
        targetClosed         = closed + goalVal;
        var targetLeads      = Math.ceil(targetClosed / closeRate);
        extraLeadsNeeded     = targetLeads - leads;
        extraRevenuePerMonth = goalVal * avgSale;
      } else {
        var extraSales       = Math.ceil(goalVal / avgSale);
        targetClosed         = closed + extraSales;
        var targetLeads2     = Math.ceil(targetClosed / closeRate);
        extraLeadsNeeded     = targetLeads2 - leads;
        extraRevenuePerMonth = goalVal;
      }

      if (extraLeadsNeeded <= 0) { showState('hitting'); return; }

      set('lg-res-close-rate',  (closeRate * 100).toFixed(1) + '%');
      set('lg-res-close-plain', 'You close 1 in ' + Math.round(1 / closeRate) + ' leads');
      set('lg-res-monthly-rev', fmtRound(currentMonthlyRev) + '/month');
      set('lg-res-extra-leads', '+' + extraLeadsNeeded + ' leads/month');
      set('lg-res-total-leads', (leads + extraLeadsNeeded) + ' leads/month total');
      set('lg-res-annual-gap',  fmtRound(extraRevenuePerMonth * 12));

      showState('results');
    }

    function showState(state) {
      hide('lg-placeholder'); hide('lg-results'); hide('lg-hitting');
      if (state === 'placeholder') show('lg-placeholder');
      else if (state === 'results') show('lg-results');
      else if (state === 'hitting') show('lg-hitting');
    }
  }

  /* ── Sales Closer ────────────────────────────────────────── */

  function bnbInitSalesCloser() {
    var root = document.getElementById('bnb-sales-closer');
    if (!root) return;

    root.querySelectorAll('.sc-period-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('.sc-period-btn').forEach(function (b) { b.classList.remove('sc-period-btn--active'); });
        btn.classList.add('sc-period-btn--active');
        var labels = { daily: 'Daily Income Goal', weekly: 'Weekly Income Goal', monthly: 'Monthly Income Goal' };
        root.querySelector('#sc-income-goal-label').textContent = labels[btn.getAttribute('data-period')];
        var res = root.querySelector('#sc-results');
        if (res) res.style.display = 'none';
      });
    });
  }

  window.bnbCalcSalesCloser = function () {
    var root = document.getElementById('bnb-sales-closer');
    if (!root) return;

    var activeBtn    = root.querySelector('.sc-period-btn--active');
    var period       = activeBtn ? activeBtn.getAttribute('data-period') : 'weekly';
    var incomeGoal   = numVal('sc-income-goal');
    var clientValue  = numVal('sc-client-value');
    var workDays     = numVal('sc-work-days');
    var clientsDaily = numVal('sc-clients-daily');

    if (incomeGoal === null || clientValue === null || workDays === null || clientsDaily === null) {
      alert('Please fill in all four fields before calculating.'); return;
    }
    if (workDays < 1 || workDays > 7) { alert('Work days must be between 1 and 7.'); return; }

    var goalWeekly = period === 'daily' ? incomeGoal * workDays
                   : period === 'monthly' ? incomeGoal * 12 / 52
                   : incomeGoal;

    var goalDaily   = roundUp10(goalWeekly / workDays);
    goalWeekly      = roundUp10(goalWeekly);
    var goalMonthly = roundUp10(goalWeekly * 52 / 12);

    var neededDaily   = Math.ceil(goalDaily / clientValue);
    var neededWeekly  = Math.ceil(neededDaily * workDays);
    var neededMonthly = Math.ceil(neededWeekly * 52 / 12);

    var capDaily   = roundUp10(clientsDaily * clientValue);
    var capWeekly  = roundUp10(capDaily * workDays);
    var capMonthly = roundUp10(capWeekly * 52 / 12);

    var diff    = capWeekly - goalWeekly;
    var diffPct = Math.abs((diff / goalWeekly) * 100).toFixed(0);

    var msg = diff < 0
      ? '<p class="sc-note sc-note--negative">Weekly shortfall of ' + fmtRound(Math.abs(diff)) + ' (' + diffPct + '% below target). Consider more clients per day, more days, or higher rates.</p>'
      : '<p class="sc-note sc-note--positive">On track — weekly surplus of ' + fmtRound(diff) + ' (' + diffPct + '% above target).</p>';

    var dayNote = workDays > 7 ? '<p class="sc-note sc-note--negative">Working more than 7 days is not possible.</p>'
               : workDays >= 6 ? '<p class="sc-note sc-note--caution">Working ' + workDays + ' days/week — watch for burnout.</p>' : '';

    function row(d, w, m) {
      return '<div class="sc-table__row"><div class="sc-table__cell">' + d + '</div><div class="sc-table__cell">' + w + '</div><div class="sc-table__cell">' + m + '</div></div>';
    }
    function header() {
      return '<div class="sc-table__row sc-table__row--header"><div class="sc-table__cell">Daily</div><div class="sc-table__cell">Weekly</div><div class="sc-table__cell">Monthly</div></div>';
    }
    function table(d, w, m) {
      return '<div class="sc-table">' + header() + row(d, w, m) + '</div>';
    }

    document.getElementById('sc-results').innerHTML =
      '<h4 class="sc-results__heading">Your Income Goals</h4>' +
      table(fmtRound(goalDaily), fmtRound(goalWeekly), fmtRound(goalMonthly)) +
      '<h4 class="sc-results__heading">Clients Needed at ' + fmtRound(clientValue) + ' Each</h4>' +
      '<p class="sc-results__sub">Working ' + workDays + ' day' + (workDays !== 1 ? 's' : '') + ' per week</p>' +
      table(neededDaily, neededWeekly, neededMonthly) +
      '<h4 class="sc-results__heading">Your Earning Capacity</h4>' +
      '<p class="sc-results__sub">' + clientsDaily + ' clients/day at ' + fmtRound(clientValue) + ' each</p>' +
      table(fmtRound(capDaily), fmtRound(capWeekly), fmtRound(capMonthly)) +
      msg + dayNote;

    document.getElementById('sc-results').style.display = '';
  };

  /* ── Conversion Value Calculator ─────────────────────────── */

  function bnbInitConversionValue() {
    var root = document.getElementById('bnb-conversion-value');
    if (!root) return;

    var slider  = root.querySelector('#cv-conversion');
    var display = root.querySelector('#cv-conversion-display');

    function updateSliderFill() {
      var min  = parseFloat(slider.min);
      var max  = parseFloat(slider.max);
      var val  = parseFloat(slider.value);
      var fill = ((val - min) / (max - min)) * 100;
      slider.style.setProperty('--cv-fill', fill.toFixed(2) + '%');
      display.textContent = val.toFixed(1) + '%';
    }

    function calcRevenue() {
      var visitors    = numVal('cv-visitors');
      var conversion  = parseFloat(slider.value);
      var closeRate   = numVal('cv-close-rate');
      var clientValue = numVal('cv-client-value');

      if (visitors === null || closeRate === null || clientValue === null) return;
      if (visitors < 1 || closeRate < 1 || clientValue < 1) return;

      var monthlyEnquiries = visitors * (conversion / 100);
      var monthlySales     = monthlyEnquiries * (closeRate / 100);
      var monthlyRevenue   = monthlySales * clientValue;
      var annualRevenue    = monthlyRevenue * 12;

      /* +1% conversion impact */
      var annualAt1PctMore = visitors * ((conversion + 1) / 100) * (closeRate / 100) * clientValue * 12;
      var impact           = annualAt1PctMore - annualRevenue;

      set('cv-monthly-enquiries', Math.round(monthlyEnquiries).toLocaleString('en-AU'));
      set('cv-monthly-sales',     monthlySales < 10 ? monthlySales.toFixed(1) : Math.round(monthlySales).toLocaleString('en-AU'));
      set('cv-monthly-revenue',   fmtRound(monthlyRevenue));
      set('cv-annual-revenue',    fmtRound(annualRevenue));
      set('cv-annual-display',    fmtK(annualRevenue));
      set('cv-impact',            '+1% conversion rate = +' + fmtRound(impact) + '/year');
    }

    slider.addEventListener('input', function () {
      updateSliderFill();
      calcRevenue();
    });

    root.querySelectorAll('input[type="number"]').forEach(function (el) {
      el.addEventListener('input', calcRevenue);
    });

    /* Initialise */
    updateSliderFill();
    calcRevenue();
  }

  /* ── Boot ────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bnbInitLeadGap();
      bnbInitSalesCloser();
      bnbInitConversionValue();
    });
  } else {
    bnbInitLeadGap();
    bnbInitSalesCloser();
    bnbInitConversionValue();
  }

})();
