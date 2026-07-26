export const KG_TO_LBS = 2.20462;

export function kgToLbs(kg) {
  return Math.round(kg * KG_TO_LBS * 10) / 10;
}

export function lbsToKg(lbs) {
  return Math.round((lbs / KG_TO_LBS) * 100) / 100;
}

// Convert a canonical kg value (from the database) into the user's display unit
export function displayWeight(kgValue, unit) {
  if (unit === 'lbs') return kgToLbs(parseFloat(kgValue));
  return parseFloat(kgValue);
}

// Convert a value the user typed (already in their preferred unit) into kg for storage
export function toStorageKg(value, unit) {
  if (unit === 'lbs') return lbsToKg(parseFloat(value));
  return parseFloat(value);
}

export function unitLabel(unit) {
  return unit === 'lbs' ? 'lbs' : 'kg';
}