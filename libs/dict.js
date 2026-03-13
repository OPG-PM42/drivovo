const ENGINE_TYPE_MAP = {
  'gasoline: Бензин': 'petrol',
  'diesel: Дизель': 'diesel',
  'gybrid: Гибрид': 'hybrid',
  'electric: Електро': 'electric',
};

const DRIVE_TYPE_MAP = {
  'full: Повний': 'AWD',
  'front: Передній': 'FWD',
  'rear: Задній': 'RWD',
};

const BODY_TYPE_MAP = {
  suv: 'suv',
  sedan: 'sedan',
  hatchback: 'hatchback',
  coupe: 'coupe',
  van: 'van',
  mpv: 'mpv',
  pickup: 'pickup',
  bus: 'bus',
};

const STATUS_MAP = {
  'aval: Доступно': 'available',
  'request: Під замовлення': 'order',
};

const INTERIOR_MAP = {
  'combine: Комбінований': 'Combined',
  'shkira: Шкіра': 'Leather',
  'textile: Текстиль': 'Textile',
};

const DICT_MAP = {
  ENGINE_TYPE_MAP,
  DRIVE_TYPE_MAP,
  BODY_TYPE_MAP,
  STATUS_MAP,
  INTERIOR_MAP,
};

export const getValue = (dictName, value, defaultValue) => {
  const dict = DICT_MAP[dictName];
  return value ? dict[value] ?? defaultValue : defaultValue;
}