'use strict';

const { getValue } = require('./dict');
const { pipe, insert } = require('./utils');

const format = ({ acf = {} } = {}) => ({
  name: acf.car_name || null,
  brand: acf.car_brand || null,
  description: acf.text || null,
  drive_type: getValue('DRIVE_TYPE_MAP', acf.drive_type, 'AWD'),
  type: getValue('BODY_TYPE_MAP', acf.body_type, 'other'),
  url: acf.url || null,
  acceleration: acf.acceleration || null,
  power: acf.power || null,
  color: acf.exterior_color || null,
  interior_trim: getValue('INTERIOR_MAP', acf.vehicle_interior),
  status: getValue('STATUS_MAP', acf.label_status, 'available'),
  engine_type: getValue('ENGINE_TYPE_MAP', acf.engine_type, 'other'),
  engine_capacity: acf.engine_capacity || null,
  engine_fuel_cons: acf.fuel_consumption
    ? String(acf.fuel_consumption)
    : null,
});

const insertCar = pipe(format, insert('cars'));

module.exports = { insertCar };
