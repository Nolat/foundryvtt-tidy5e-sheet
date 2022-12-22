/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */

export const preloadTidy5eHandlebarsTemplates = async function () {
  // Define template paths to load
  const tidy5etemplatePaths = [
    // Actor Sheet Partials
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-traits.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-inventory.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-inventory-grid.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-inventory-header.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-inventory-footer.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-features.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-spellbook.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-spellbook-grid.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-spellbook-header.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-spellbook-footer.html",
    "modules/foundryvtt-tidy5e-sheet-nolat/templates/actors/parts/tidy5e-effects.html",
  ];

  // Load the template parts
  return loadTemplates(tidy5etemplatePaths);
};
