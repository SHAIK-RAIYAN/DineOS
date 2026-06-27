export const ORGANIZATION_ID = '11111111-1111-1111-1111-111111111111'

export const OUTLET_IDS = {
  ROOFTOP_BAR: '33333333-3333-3333-3333-333333333333',
  ALL_DAY_CAFE: '44444444-4444-4444-4444-444444444444',
  BANQUET_KITCHEN: '55555555-5555-5555-5555-555555555555',
} as const

export const DEFAULT_OUTLET_ID = OUTLET_IDS.ROOFTOP_BAR

export const MODIFIER_PRESETS = [
  { key: 'extra_sauce', label: 'Extra Sauce' },
  { key: 'no_cheese', label: 'No Cheese' },
  { key: 'spicy', label: 'Spicy' },
] as const
