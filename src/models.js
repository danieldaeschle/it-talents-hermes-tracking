const { Sequelize, DataTypes } = require('sequelize');
const process = require('process');
const Joi = require('joi');

// Default db URI
let dbUrl = 'sqlite://database.sqlite';

// If test run use in memory database
if (process.env.NODE_ENV === 'test') {
  dbUrl = ':memory:';
}

const db = new Sequelize({
  logging: false,
  dialect: 'sqlite',
  storage: dbUrl
});

const Track = db.define('Track', {
  trackingNumber: {
    type: DataTypes.STRING,
    primaryKey: true,
    unique: true
  },
  senderPostCode: {
    type: DataTypes.STRING,
  },
  receiverPostCode: {
    type: DataTypes.STRING,
  },
  date: {
    type: DataTypes.STRING,
  },
  packageSize: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 4
    }
  },
  isExpress: {
    type: DataTypes.BOOLEAN,
  }
});

const TrackSchema = Joi.object().keys({
  senderPostCode: Joi.string().required(),
  receiverPostCode: Joi.string().required(),
  date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}T(\d{2}:){2}\d{2}(\.\d{1,6})?Z$/).required(),
  packageSize: Joi.number().integer().min(1).max(4).required(),
  isExpress: Joi.boolean().default(false)
});

const PackageState = db.define('PackageState', {
  progress: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 4
    },
    unique: true
  },
  locationPostCode: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.STRING
  }
});

const PackageStateSchema = Joi.object().keys({
  progress: Joi.number().integer().min(1).max(4).required(),
  locationPostCode: Joi.string().required(),
  message: Joi.string().default(null)
});

Track.hasMany(PackageState, { foreignKey: 'trackingNumber', as: 'packageStates' });
PackageState.belongsTo(Track, { foreignKey: 'trackingNumber' });
Track.sync();
PackageState.sync();

module.exports = {Track, TrackSchema, PackageState, PackageStateSchema};
