/**
 * BNB Property Tools — Calculator Logic
 *
 * Tools:
 *   bnbCalcAnnualRevenue()  — button-triggered, Annual Revenue Estimator
 *   bnbCalcNetRevenue()     — button-triggered, Per-Booking Net Revenue Estimator
 *   Lead Gap Calculator     — live/real-time, initialised via bnbInitLeadGap()
 *   bnbCalcSalesCloser()    — button-triggered, Sales Closer Goals Calculator
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

  /* ── Sales Closer — Sales Goals Calculator ───────────────── */

  function bnbInitSalesCloser() {
    var root = document.getElementById('bnb-sales-closer');
    if (!root) return;

    /* period toggle */
    root.querySelectorAll('.sc-period-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        root.querySelectorAll('.sc-period-btn').forEach(function (b) {
          b.classList.remove('sc-period-btn--active');
        });
        btn.classList.add('sc-period-btn--active');
        var period = btn.getAttribute('data-period');
        var labels = { daily: 'Daily Income Goal', weekly: 'Weekly Income Goal', monthly: 'Monthly Income Goal' };
        root.querySelector('#sc-income-goal-label').textContent = labels[period];
        /* clear results when period changes */
        var res = root.querySelector('#sc-results');
        if (res) res.style.display = 'none';
      });
    });
  }

  window.bnbCalcSalesCloser = function () {
    var root = document.getElementById('bnb-sales-closer');
    if (!root) return;

    var activeBtn  = root.querySelector('.sc-period-btn--active');
    var period     = activeBtn ? activeBtn.getAttribute('data-period') : 'weekly';

    var incomeGoal    = numVal('sc-income-goal');
    var clientValue   = numVal('sc-client-value');
    var workDays      = numVal('sc-work-days');
    var clientsDaily  = numVal('sc-clients-daily');

    if (incomeGoal === null || clientValue === null || workDays === null || clientsDaily === null) {
      alert('Please fill in all four fields before calculating.');
      return;
    }
    if (workDays < 1 || workDays > 7) {
      alert('Work days must be between 1 and 7.');
      return;
    }

    /* Normalise the entered goal to a weekly figure, then derive all periods */
    var goalWeekly;
    if (period === 'daily') {
      goalWeekly = incomeGoal * workDays;
    } else if (period === 'monthly') {
      goalWeekly = incomeGoal * 12 / 52;
    } else {
      goalWeekly = incomeGoal;
    }

    var goalDaily   = roundUp10(goalWeekly / workDays);
    goalWeekly      = roundUp10(goalWeekly);
    var goalMonthly = roundUp10(goalWeekly * 52 / 12);

    /* Clients needed to hit the goal each period */
    var neededDaily   = Math.ceil(goalDaily / clientValue);
    var neededWeekly  = Math.ceil(neededDaily * workDays);
    var neededMonthly = Math.ceil(neededWeekly * 52 / 12);

    /* Actual income capacity based on clients they can see */
    var capacityDaily   = roundUp10(clientsDaily * clientValue);
    var capacityWeekly  = roundUp10(capacityDaily * workDays);
    var capacityMonthly = roundUp10(capacityWeekly * 52 / 12);

    var weeklyDiff    = capacityWeekly - goalWeekly;
    var weeklyDiffPct = Math.abs(((weeklyDiff / goalWeekly) * 100)).toFixed(0);

    var message;
    if (weeklyDiff < 0) {
      message = '<p class="sc-note sc-note--negative">' +
        'Based on these numbers there is a weekly shortfall of ' + fmtRound(Math.abs(weeklyDiff)) +
        ' (' + weeklyDiffPct + '% below target). Consider seeing more clients each day, working more days, or increasing your rates.' +
        '</p>';
    } else {
      message = '<p class="sc-note sc-note--positive">' +
        'You will hit your target with a weekly surplus of ' + fmtRound(weeklyDiff) +
        ' (' + weeklyDiffPct + '% above target).' +
        '</p>';
    }

    var dayNote = '';
    if (workDays > 7) {
      dayNote = '<p class="sc-note sc-note--negative">Working more than 7 days a week is not possible — please adjust your work days.</p>';
    } else if (workDays >= 6) {
      dayNote = '<p class="sc-note sc-note--caution">Working ' + workDays + ' days a week is demanding. Be mindful of burnout.</p>';
    }

    var html =
      '<h4 class="sc-results__heading">Your Income Goals</h4>' +
      '<div class="sc-table">' +
        '<div class="sc-table__row sc-table__row--header">' +
          '<div class="sc-table__cell">Daily</div>' +
          '<div class="sc-table__cell">Weekly</div>' +
          '<div class="sc-table__cell">Monthly</div>' +
        '</div>' +
        '<div class="sc-table__row">' +
          '<div class="sc-table__cell">' + fmtRound(goalDaily) + '</div>' +
          '<div class="sc-table__cell">' + fmtRound(goalWeekly) + '</div>' +
          '<div class="sc-table__cell">' + fmtRound(goalMonthly) + '</div>' +
        '</div>' +
      '</div>' +
      '<h4 class="sc-results__heading">Clients Needed at ' + fmtRound(clientValue) + ' Each</h4>' +
      '<p class="sc-results__sub">Working ' + workDays + ' day' + (workDays !== 1 ? 's' : '') + ' per week</p>' +
      '<div class="sc-table">' +
        '<div class="sc-table__row sc-table__row--header">' +
          '<div class="sc-table__cell">Daily</div>' +
          '<div class="sc-table__cell">Weekly</div>' +
          '<div class="sc-table__cell">Monthly</div>' +
        '</div>' +
        '<div class="sc-table__row">' +
          '<div class="sc-table__cell">' + neededDaily + '</div>' +
          '<div class="sc-table__cell">' + neededWeekly + '</div>' +
          '<div class="sc-table__cell">' + neededMonthly + '</div>' +
        '</div>' +
      '</div>' +
      '<h4 class="sc-results__heading">Your Earning Capacity</h4>' +
      '<p class="sc-results__sub">Based on ' + clientsDaily + ' clients/day at ' + fmtRound(clientValue) + ' each</p>' +
      '<div class="sc-table">' +
        '<div class="sc-table__row sc-table__row--header">' +
          '<div class="sc-table__cell">Daily</div>' +
          '<div class="sc-table__cell">Weekly</div>' +
          '<div class="sc-table__cell">Monthly</div>' +
        '</div>' +
        '<div class="sc-table__row">' +
          '<div class="sc-table__cell">' + fmtRound(capacityDaily) + '</div>' +
          '<div class="sc-table__cell">' + fmtRound(capacityWeekly) + '</div>' +
          '<div class="sc-table__cell">' + fmtRound(capacityMonthly) + '</div>' +
        '</div>' +
      '</div>' +
      message + dayNote;

    var resultsEl = document.getElementById('sc-results');
    resultsEl.innerHTML = html;
    resultsEl.style.display = '';
  };

  /* ── Boot ────────────────────────────────────────────────── */

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      bnbInitLeadGap();
      bnbInitSalesCloser();
    });
  } else {
    bnbInitLeadGap();
    bnbInitSalesCloser();
  }

})();
