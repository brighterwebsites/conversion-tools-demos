<?php
/**
 * Plugin Name: BNB Property Tools
 * Plugin URI:  https://brighterwebsites.com.au
 * Description: A showcase of short-term rental calculators — Annual Revenue Estimator and Per-Booking Net Revenue Estimator — embedded via shortcodes.
 * Version:     1.0.0
 * Author:      Brighter Websites
 * Author URI:  https://brighterwebsites.com.au
 * License:     GPL-2.0+
 * Text Domain: bnb-property-tools
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BNB_TOOLS_VERSION', '1.0.0' );
define( 'BNB_TOOLS_URL', plugin_dir_url( __FILE__ ) );
define( 'BNB_TOOLS_PATH', plugin_dir_path( __FILE__ ) );

/**
 * Enqueue front-end assets only when a shortcode is present on the page.
 */
add_action( 'wp_enqueue_scripts', 'bnb_tools_enqueue_assets' );
function bnb_tools_enqueue_assets() {
	wp_register_style(
		'bnb-property-tools',
		BNB_TOOLS_URL . 'assets/css/bnb-tools.css',
		[],
		BNB_TOOLS_VERSION
	);
	wp_register_script(
		'bnb-property-tools',
		BNB_TOOLS_URL . 'assets/js/bnb-tools.js',
		[],
		BNB_TOOLS_VERSION,
		true
	);
}

/**
 * Helper: enqueue assets and return an opening wrapper div.
 */
function bnb_tools_wrap( $tool_id ) {
	wp_enqueue_style( 'bnb-property-tools' );
	wp_enqueue_script( 'bnb-property-tools' );
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
