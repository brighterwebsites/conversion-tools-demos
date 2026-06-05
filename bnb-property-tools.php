<?php
/**
 * Plugin Name: BNB Property Tools
 * Plugin URI:  https://brighterwebsites.com.au
 * Description: A showcase of calculators for web agency and short-term rental clients — embedded via shortcodes. Assets load only on pages that use a shortcode.
 * Version:     1.3.0
 * Author:      Brighter Websites
 * Author URI:  https://brighterwebsites.com.au
 * License:     GPL-2.0+
 * Text Domain: bnb-property-tools
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BNB_TOOLS_VERSION', '1.3.0' );
define( 'BNB_TOOLS_URL', plugin_dir_url( __FILE__ ) );
define( 'BNB_TOOLS_PATH', plugin_dir_path( __FILE__ ) );

/**
 * All registered shortcode tags — used for conditional asset loading.
 */
function bnb_tools_shortcodes() {
	return [ 'bnb_annual_revenue', 'bnb_net_revenue', 'bnb_lead_gap', 'bnb_sales_closer', 'bnb_conversion_value' ];
}

/**
 * Enqueue assets only on pages/posts that actually contain one of our shortcodes.
 */
add_action( 'wp_enqueue_scripts', 'bnb_tools_enqueue_assets' );
function bnb_tools_enqueue_assets() {
	global $post;

	if ( ! is_a( $post, 'WP_Post' ) ) {
		return;
	}

	$needed = false;
	foreach ( bnb_tools_shortcodes() as $tag ) {
		if ( has_shortcode( $post->post_content, $tag ) ) {
			$needed = true;
			break;
		}
	}

	if ( ! $needed ) {
		return;
	}

	wp_enqueue_style(
		'bnb-property-tools',
		BNB_TOOLS_URL . 'assets/css/bnb-tools.css',
		[],
		BNB_TOOLS_VERSION
	);
	wp_enqueue_script(
		'bnb-property-tools',
		BNB_TOOLS_URL . 'assets/js/bnb-tools.js',
		[],
		BNB_TOOLS_VERSION,
		true
	);
}

/**
 * Returns an opening wrapper div.
 */
function bnb_tools_wrap( $tool_id ) {
	return '<div class="bnb-tool" id="' . esc_attr( $tool_id ) . '">';
}

// ---------------------------------------------------------------------------
// Shortcode 1: Annual Revenue Estimator
// Usage: [bnb_annual_revenue]
// ---------------------------------------------------------------------------
add_shortcode( 'bnb_annual_revenue', 'bnb_annual_revenue_shortcode' );
function bnb_annual_revenue_shortcode() {
	ob_start();
	echo bnb_tools_wrap( 'bnb-annual-revenue' );
	?>
	<div class="bnb-tool__header">
		<span class="bnb-tool__badge">Free Calculator</span>
		<h2 class="bnb-tool__title">Annual Revenue Estimator</h2>
		<p class="bnb-tool__subtitle">Find out how much your short-term rental could earn in a year.</p>
	</div>

	<div class="bnb-tool__body">
		<div class="bnb-tool__inputs">
			<div class="bnb-tool__field">
				<label for="bnb-occupancy">Occupancy Rate</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-occupancy" min="1" max="100" value="48" />
					<span class="bnb-tool__unit">%</span>
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-daily-rate">Average Daily Rate</label>
				<div class="bnb-tool__input-wrap">
					<span class="bnb-tool__unit bnb-tool__unit--prefix">$</span>
					<input type="number" id="bnb-daily-rate" min="1" value="365" />
				</div>
			</div>
		</div>

		<button class="bnb-tool__btn" onclick="bnbCalcAnnualRevenue()">Calculate My Revenue</button>

		<div class="bnb-tool__result" id="bnb-annual-result" style="display:none;">
			<p class="bnb-tool__result-label">Estimated Annual Revenue</p>
			<p class="bnb-tool__result-value" id="bnb-annual-value">$0</p>
		</div>
	</div>

	<div class="bnb-tool__cta">
		<p>Want to maximise this figure? <strong>Talk to our team</strong> about professional short-term rental management.</p>
		<a class="bnb-tool__cta-btn" href="/contact">Get a Free Appraisal &rarr;</a>
	</div>
	</div>
	<?php
	return ob_get_clean();
}

// ---------------------------------------------------------------------------
// Shortcode 2: Net Revenue Estimator (per booking)
// Usage: [bnb_net_revenue]
// ---------------------------------------------------------------------------
add_shortcode( 'bnb_net_revenue', 'bnb_net_revenue_shortcode' );
function bnb_net_revenue_shortcode() {
	ob_start();
	echo bnb_tools_wrap( 'bnb-net-revenue' );
	?>
	<div class="bnb-tool__header">
		<span class="bnb-tool__badge">Free Calculator</span>
		<h2 class="bnb-tool__title">Net Revenue Estimator</h2>
		<p class="bnb-tool__subtitle">See exactly what you'll take home after fees — per booking.</p>
	</div>

	<div class="bnb-tool__body">
		<div class="bnb-tool__inputs bnb-tool__inputs--grid">
			<div class="bnb-tool__field">
				<label for="bnb-nightly-rate">Nightly Rate</label>
				<div class="bnb-tool__input-wrap">
					<span class="bnb-tool__unit bnb-tool__unit--prefix">$</span>
					<input type="number" id="bnb-nightly-rate" min="1" value="550" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-nights">Number of Nights</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-nights" min="1" value="2" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-guests">Max Guests</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-guests" min="1" value="4" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-beds">Number of Beds</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-beds" min="1" value="2" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-bedrooms">Bedrooms</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-bedrooms" min="1" value="2" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-bathrooms">Bathrooms / Ensuites</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-bathrooms" min="1" value="2" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-living">Living Areas</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-living" min="1" value="1" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-kitchens">Kitchens</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-kitchens" min="1" value="1" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="bnb-mgmt-rate">Management Fee</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="bnb-mgmt-rate" min="0" max="100" step="0.5" value="20" />
					<span class="bnb-tool__unit">%</span>
				</div>
			</div>
		</div>

		<button class="bnb-tool__btn" onclick="bnbCalcNetRevenue()">Calculate My Net Revenue</button>

		<div class="bnb-tool__result bnb-tool__result--breakdown" id="bnb-net-result" style="display:none;">
			<div class="bnb-result-row bnb-result-row--highlight">
				<span>Total Guest Fee</span>
				<span id="bnb-res-guest-fee">$0</span>
			</div>
			<div class="bnb-result-row">
				<span>Cleaning Fee</span>
				<span id="bnb-res-cleaning">$0</span>
			</div>
			<div class="bnb-result-row">
				<span>Linen Fee</span>
				<span id="bnb-res-linen">$0</span>
			</div>
			<div class="bnb-result-row">
				<span>Management Fee</span>
				<span id="bnb-res-mgmt">$0</span>
			</div>
			<div class="bnb-result-row">
				<span>Booking Commission (17%)</span>
				<span id="bnb-res-commission">$0</span>
			</div>
			<div class="bnb-result-row bnb-result-row--total">
				<span>You Receive</span>
				<span id="bnb-res-owner">$0</span>
			</div>
			<div class="bnb-result-row bnb-result-row--pct">
				<span>That's</span>
				<span id="bnb-res-pct">0%</span>
			</div>
		</div>

		<p class="bnb-tool__disclaimer">* Online booking commissions and credit card fees may vary. Consumables (tea, coffee, toilet paper, etc.) are not included.</p>
	</div>

	<div class="bnb-tool__cta">
		<p>Ready to see these numbers in real life? <strong>Let our team handle everything</strong> so you keep more of what you earn.</p>
		<a class="bnb-tool__cta-btn" href="/contact">Start Earning More Today &rarr;</a>
	</div>
	</div>
	<?php
	return ob_get_clean();
}

// ---------------------------------------------------------------------------
// Shortcode 3: Lead & Revenue Gap Calculator
// Usage: [bnb_lead_gap]
// ---------------------------------------------------------------------------
add_shortcode( 'bnb_lead_gap', 'bnb_lead_gap_shortcode' );
function bnb_lead_gap_shortcode() {
	ob_start();
	echo bnb_tools_wrap( 'bnb-lead-gap' );
	?>
	<div class="bnb-tool__header">
		<span class="bnb-tool__badge">Free Calculator</span>
		<h2 class="bnb-tool__title">Lead &amp; Revenue Gap Calculator</h2>
		<p class="bnb-tool__subtitle">Find out exactly how many more leads you need to hit your goal — and what that gap costs you every year.</p>
	</div>

	<div class="bnb-lead-gap__layout">
		<div class="bnb-lead-gap__inputs">
			<div class="bnb-tool__field">
				<label for="lg-monthly-leads">How many leads do you get each month?</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="lg-monthly-leads" min="1" placeholder="e.g. 40" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="lg-monthly-closed">How many of those do you close?</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="lg-monthly-closed" min="0" placeholder="e.g. 10" />
				</div>
				<span class="bnb-tool__field-error" id="lg-closed-error"></span>
			</div>
			<div class="bnb-tool__field">
				<label for="lg-avg-sale">What's your average $ per closed sale?</label>
				<div class="bnb-tool__input-wrap">
					<span class="bnb-tool__unit bnb-tool__unit--prefix">$</span>
					<input type="number" id="lg-avg-sale" min="1" placeholder="e.g. 2500" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label>What's your goal?</label>
				<div class="lg-toggle" role="group" aria-label="Goal type">
					<button type="button" class="lg-toggle__btn lg-toggle__btn--active" id="lg-goal-clients" data-goal="clients">More clients</button>
					<button type="button" class="lg-toggle__btn" id="lg-goal-revenue" data-goal="revenue">More revenue</button>
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="lg-goal-value" id="lg-goal-value-label">How many more clients per month?</label>
				<div class="bnb-tool__input-wrap" id="lg-goal-value-wrap">
					<span class="bnb-tool__unit bnb-tool__unit--prefix" style="display:none;">$</span>
					<input type="number" id="lg-goal-value" min="1" placeholder="e.g. 5" />
				</div>
			</div>
		</div>

		<div class="bnb-lead-gap__output" id="lg-output">
			<div class="lg-placeholder" id="lg-placeholder">
				<div class="lg-placeholder__icon">&#9650;</div>
				<p>Fill in your numbers<br>to see your gap</p>
			</div>
			<div class="lg-results" id="lg-results" style="display:none;">
				<div class="lg-stat">
					<span class="lg-stat__label">Your close rate</span>
					<span class="lg-stat__value" id="lg-res-close-rate">&mdash;</span>
					<span class="lg-stat__sub" id="lg-res-close-plain">&mdash;</span>
				</div>
				<div class="lg-stat">
					<span class="lg-stat__label">Current monthly revenue</span>
					<span class="lg-stat__value" id="lg-res-monthly-rev">&mdash;</span>
				</div>
				<div class="lg-divider"></div>
				<div class="lg-stat">
					<span class="lg-stat__label">Extra leads needed</span>
					<span class="lg-stat__value" id="lg-res-extra-leads">&mdash;</span>
					<span class="lg-stat__sub" id="lg-res-total-leads">&mdash;</span>
				</div>
				<div class="lg-gap-hero">
					<span class="lg-gap-hero__label">Solving your lead gap is worth</span>
					<span class="lg-gap-hero__value" id="lg-res-annual-gap">$0</span>
					<span class="lg-gap-hero__sub">per year in additional revenue</span>
				</div>
			</div>
			<div class="lg-hitting" id="lg-hitting" style="display:none;">
				<div class="lg-hitting__icon">&#10003;</div>
				<p>You're already hitting that goal</p>
			</div>
		</div>
	</div>

	<div class="bnb-tool__cta">
		<p>Know your gap. Now let's close it. <strong>We build the systems</strong> that turn more leads into paying clients.</p>
		<a class="bnb-tool__cta-btn" href="/contact">Let's Talk Strategy &rarr;</a>
	</div>
	</div>
	<?php
	return ob_get_clean();
}

// ---------------------------------------------------------------------------
// Shortcode 4: Sales Closer — Sales Goals Calculator
// Usage: [bnb_sales_closer]
// ---------------------------------------------------------------------------
add_shortcode( 'bnb_sales_closer', 'bnb_sales_closer_shortcode' );
function bnb_sales_closer_shortcode() {
	ob_start();
	echo bnb_tools_wrap( 'bnb-sales-closer' );
	?>
	<div class="bnb-tool__header">
		<span class="bnb-tool__badge">Free Calculator</span>
		<h2 class="bnb-tool__title">Sales Closer &mdash; Sales Goals Calculator</h2>
		<p class="bnb-tool__subtitle">Set a daily, weekly, or monthly income target and find out exactly how many clients you need to hit it.</p>
	</div>

	<div class="bnb-tool__body">
		<div class="bnb-tool__field sc-goal-field">
			<label>I want to set a goal based on my</label>
			<div class="sc-period-toggle" role="group" aria-label="Goal period">
				<button type="button" class="sc-period-btn" data-period="daily">Daily</button>
				<button type="button" class="sc-period-btn sc-period-btn--active" data-period="weekly">Weekly</button>
				<button type="button" class="sc-period-btn" data-period="monthly">Monthly</button>
			</div>
		</div>

		<div class="bnb-tool__inputs bnb-tool__inputs--grid">
			<div class="bnb-tool__field">
				<label for="sc-income-goal" id="sc-income-goal-label">Weekly Income Goal</label>
				<div class="bnb-tool__input-wrap">
					<span class="bnb-tool__unit bnb-tool__unit--prefix">$</span>
					<input type="number" id="sc-income-goal" min="1" placeholder="e.g. 3000" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="sc-client-value">Average Client Value</label>
				<div class="bnb-tool__input-wrap">
					<span class="bnb-tool__unit bnb-tool__unit--prefix">$</span>
					<input type="number" id="sc-client-value" min="1" placeholder="e.g. 150" />
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="sc-work-days">Days You Work per Week</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="sc-work-days" min="1" max="7" placeholder="e.g. 5" />
					<span class="bnb-tool__unit">days</span>
				</div>
			</div>
			<div class="bnb-tool__field">
				<label for="sc-clients-daily">Clients You Can See per Day</label>
				<div class="bnb-tool__input-wrap">
					<input type="number" id="sc-clients-daily" min="1" placeholder="e.g. 6" />
					<span class="bnb-tool__unit">/ day</span>
				</div>
			</div>
		</div>

		<button class="bnb-tool__btn" onclick="bnbCalcSalesCloser()">Calculate My Goals</button>
		<div class="sc-results" id="sc-results" style="display:none;"></div>
		<p class="bnb-tool__disclaimer">* Some figures have been rounded during calculations.</p>
	</div>

	<div class="bnb-tool__cta">
		<p>Ready to close more sales? <strong>Let's talk strategy</strong> and build a plan to hit your income goals.</p>
		<a class="bnb-tool__cta-btn" href="/contact">Book a Free Strategy Call &rarr;</a>
	</div>
	</div>
	<?php
	return ob_get_clean();
}

// ---------------------------------------------------------------------------
// Shortcode 5: Conversion Value Calculator
// Usage: [bnb_conversion_value]
//
// Formula: Visitors × (Conversion%/100) × (CloseRate%/100) × ClientValue × 12
// Enquiry conversion rate uses a slider; all other fields are number inputs.
// Updates live on every change — no submit button.
// ---------------------------------------------------------------------------
add_shortcode( 'bnb_conversion_value', 'bnb_conversion_value_shortcode' );
function bnb_conversion_value_shortcode() {
	ob_start();
	echo bnb_tools_wrap( 'bnb-conversion-value' );
	?>
	<div class="bnb-tool__header">
		<span class="bnb-tool__badge">Free Calculator</span>
		<h2 class="bnb-tool__title">What Conversion Infrastructure Can Change for Your Business</h2>
		<p class="bnb-tool__subtitle">Move any one of these four levers and revenue changes. Move several and growth compounds.</p>
	</div>

	<div class="bnb-tool__body">

		<div class="cv-inputs">

			<div class="cv-row">
				<div class="bnb-tool__field">
					<label for="cv-visitors">Monthly Visitors</label>
					<div class="bnb-tool__input-wrap">
						<input type="number" id="cv-visitors" min="1" value="500" />
						<span class="bnb-tool__unit">/ mo</span>
					</div>
				</div>

				<div class="bnb-tool__field">
					<label for="cv-close-rate">Sales Close Rate</label>
					<div class="bnb-tool__input-wrap">
						<input type="number" id="cv-close-rate" min="1" max="100" value="30" />
						<span class="bnb-tool__unit">%</span>
					</div>
				</div>

				<div class="bnb-tool__field">
					<label for="cv-client-value">Avg. Client Value</label>
					<div class="bnb-tool__input-wrap">
						<span class="bnb-tool__unit bnb-tool__unit--prefix">$</span>
						<input type="number" id="cv-client-value" min="1" value="5000" />
					</div>
				</div>
			</div>

			<div class="cv-slider-field">
				<div class="cv-slider-header">
					<label for="cv-conversion">Enquiry Conversion Rate</label>
					<span class="cv-slider-badge" id="cv-conversion-display">3.0%</span>
				</div>
				<input type="range" id="cv-conversion" class="cv-slider" min="0.1" max="20" step="0.1" value="3" />
				<div class="cv-slider-labels">
					<span>0.1%</span>
					<span>10%</span>
					<span>20%</span>
				</div>
			</div>

		</div>

		<div class="cv-result">
			<div class="cv-result__hero">
				<div>
					<p class="cv-result__label">Estimated Annual Revenue</p>
					<p class="cv-result__value" id="cv-annual-revenue">$270,000</p>
				</div>
				<div class="cv-result__monthly">
					<p class="cv-result__label">Per Month</p>
					<p class="cv-result__monthly-value" id="cv-monthly-revenue">$22,500</p>
				</div>
			</div>
			<div class="cv-result__funnel">
				<div class="cv-funnel-step">
					<span class="cv-funnel-step__value" id="cv-monthly-enquiries">15</span>
					<span class="cv-funnel-step__label">Enquiries</span>
				</div>
				<span class="cv-funnel-arrow">&#8594;</span>
				<div class="cv-funnel-step">
					<span class="cv-funnel-step__value" id="cv-monthly-sales">5</span>
					<span class="cv-funnel-step__label">Sales</span>
				</div>
				<span class="cv-funnel-arrow">&#8594;</span>
				<div class="cv-funnel-step cv-funnel-step--highlight">
					<span class="cv-funnel-step__value" id="cv-annual-display">$270k</span>
					<span class="cv-funnel-step__label">Annual</span>
				</div>
			</div>
			<p class="cv-result__impact" id="cv-impact">+1% conversion rate = +$90,000/year</p>
		</div>

	</div>

	<div class="bnb-tool__cta">
		<p>A better-converting website is the highest-ROI investment you can make. <strong>Let's build yours.</strong></p>
		<a class="bnb-tool__cta-btn" href="/contact">Get a Free Strategy Call &rarr;</a>
	</div>
	</div>
	<?php
	return ob_get_clean();
}
