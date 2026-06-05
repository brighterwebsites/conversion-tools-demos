# Custom Conversion Tools — WordPress Plugin

A showcase of short-term rental calculators for WordPress. Embed both tools anywhere with a simple shortcode.

## Shortcodes

| Shortcode | Description |
|-----------|-------------|
| `[bnb_annual_revenue]` | Annual Revenue Estimator — occupancy % × daily rate × 365 |
| `[bnb_net_revenue]` | Per-Booking Net Revenue Estimator — full fee breakdown and owner net |

## Installation

1. Upload the `bnb-property-tools` folder to `/wp-content/plugins/`.
2. Activate the plugin from **Plugins → Installed Plugins**.
3. Add `[bnb_annual_revenue]` or `[bnb_net_revenue]` to any page, post, or widget.

## Annual Revenue Estimator

**Inputs:** Occupancy Rate (%), Average Daily Rate ($)
**Formula:** `(Occupancy / 100) × Daily Rate × 365`

## Net Revenue Estimator

**Inputs:** Nightly Rate, Nights, Guests, Beds, Bedrooms, Bathrooms, Living Areas, Kitchens, **Management Fee %** (user-defined)

**Outputs:**
- Total Guest Fee
- Cleaning Fee (based on property size)
- Linen Fee
- Management Fee (user-defined %)
- Booking Commission (17%)
- **Owner Net + Net %**

> Booking commissions and credit card processing fees may vary. Consumables (tea, coffee, toiletries, etc.) are not included.

## Extending

Additional tools can be added by registering a new shortcode in `bnb-property-tools.php` and dropping the logic into `assets/js/bnb-tools.js`. All tools share the same CSS design system via `assets/css/bnb-tools.css`.

## License

GPL-2.0+
