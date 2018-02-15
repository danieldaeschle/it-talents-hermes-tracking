const { Sequelize, DataTypes } = require('sequelize');

const database = new Sequelize('sqlite://database.sqlite');

const Track = database.define('track', {
  senderPostCode: {
    type: DataTypes.STRING,
    field: 'SenderPostCode'
  },
  receiverPostCode: {
    type: DataTypes.STRING,
    field: 'ReceiverPostCode'
  },
  date: {
    type: DataTypes.STRING,
    field: 'Date'
  },
  packageSize: {
    type: DataTypes.INTEGER,
    field: 'PackageSize'
  },
  isExpress: {
    type: DataTypes.BOOLEAN,
    field: 'IsExpress'
  },
  trackingNumber: {
    type: DataTypes.STRING,
    field: 'TrackingNumber'
  }
});

Track.sync();

module.exports = {Track};

