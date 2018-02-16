const express = require('express');
const payloadValidator = require('payload-validator');

const { Track } = require('../models');
const { generateTrackingNumber } = require('../lib');

const router = express.Router();

router.route('/api/tracks/:trackingId')
  .get((req, res) => {
    let id = req.params.trackingId;

    Track.findOne({ where: { trackingNumber: id } }).then(track => {
      if (track) {
        res.json({
          trackingNumber: track.trackingNumber,
          senderPostCode: track.senderPostCode,
          receiverPostCode: track.receiverPostCode,
          date: track.date,
          packageSize: track.packageSize,
          isExpress: track.isExpress
        });
      } else {
        res.status(404).json({ message: 'Tracking id doesn\'t exists' });
      }
    });
  })
  .put((req, res) => {
    let id = req.params.trackingId;

    // Validate payload
    let result = payloadValidator.validator(req.body, {
      senderPostCode: ''
    }, ['senderPostCode', 'receiverPostCode', 'date', 'packageSize', 'isExpress'], true);

    if (result.success) {
      Track
        .update(result.elements, { where: { trackingNumber: id } })
        .then(result => {
          res.send(result);
        });
    } else {
      res.status(400).json({ message: result.response.errorMessage });
    }
  });

router.post('/api/tracks', (req, res) => {
  // Validate payload
  let result = payloadValidator.validator(req.body, {
    senderPostCode: '',
    receiverPostCode: '',
    date: '',
    packageSize: 1,
    isExpress: false
  }, ['senderPostCode', 'receiverPostCode', 'date', 'packageSize', 'isExpress'], true);

  // Check if validation is successful
  if (result.success) {
    let data = result.elements;
    result.elements.trackingNumber = generateTrackingNumber(
      data.senderPostCode,
      data.receiverPostCode,
      data.date,
      data.packageSize,
      data.isExpress
    );

    // Create object or return error
    Track
      .findOrCreate({
        where: data,
        defaults: {
          trackingNumber: data.trackingNumber
        }
      })
      .spread((track, created) => {
        if (created) {
          res.json({
            trackingNumber: track.trackingNumber,
            senderPostCode: track.senderPostCode,
            receiverPostCode: track.receiverPostCode,
            date: track.date,
            packageSize: track.packageSize,
            isExpress: track.isExpress
          });
        } else {
          res.status(400).json({ message: 'Track already exists' });
        }
      });
  } else {
    res.status(400).json({ message: result.response.errorMessage });
  }
});

module.exports = router;