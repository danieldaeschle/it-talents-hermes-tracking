const { Sequelize, DataTypes } = require('sequelize');

const db = new Sequelize('sqlite://database.sqlite', {
  logging: false
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

const PackageState = db.define('PackageState', {
  progress: {
    type: DataTypes.INTEGER,
    validate: {
      min: 1,
      max: 5
    },
    unique: true
  },
  locationPostCode: {
    type: DataTypes.STRING
  },
  message: {
    type: DataTypes.STRING
  },
  trackId: {
    type: DataTypes.INTEGER,
    references: {
      model: Track,
      key: 'trackingNumber'
    }
  }
});

PackageState.sync();
Track.hasMany(PackageState);
Track.sync();

module.exports = {Track, PackageState};
