/**
 * Date utilities for TennisTour
 */

function parseDateParts(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const [year, month, day] = date.split('-').map(Number);
  return { year, month, day };
}

module.exports = {
  parseDateParts
};
