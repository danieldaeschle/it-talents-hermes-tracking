const express = require('express');
const Joi = require('joi');

const { Track, TrackSchema, PackageState, PackageStateSchema } = require('../models');
const { generateTrackingNumber } = require('../lib');

const router = express.Router();

router.route('/api/tracks/:trackingId')
  /**
   * Returns on track by tracking id
   */
  .get((req, res) => {
    let id = req.params.trackingId;

    Track.findOne({
      where: { trackingNumber: id },
      include: { model: PackageState, as: 'packageStates' }
    }).then(track => {
      if (track) {
        track = track.dataValues;
        track.packageStates = track.packageStates
          .map(state => {
            return {
              progress: state.progress,
              locationPostCode: state.locationPostCode,
              message: state.message,
              timestamp: state.createdAt
            };
          });

        res.json({
          trackingNumber: track.trackingNumber,
          senderPostCode: track.senderPostCode,
          receiverPostCode: track.receiverPostCode,
          date: track.date,
          packageSize: track.packageSize,
          isExpress: track.isExpress,
          packageStates: track.packageStates
        });
      } else {
        res.status(404).json({ message: 'Tracking number doesn\'t exists' });
      }
    });
  })
  /**
   * Creates a track state by tracking id
   */
  .post((req, res) => {
    let id = req.params.trackingId;

    // Validate payload
    let {error, value} = Joi.validate(req.body, PackageStateSchema);
    value.trackingNumber = id;

    if (!error) {
      // Create package state or return error
      PackageState
        .findOrCreate({
          where: {
            progress: value.progress,
            trackingNumber: id
          },
          defaults: value
        })
        .spread((track, created) => {
          if (created) {
            track = track.dataValues;
            // On saved
            res.json({
              data: {
                trackId: track.trackId,
                locationPostCode: track.locationPostCode,
                message: track.message,
                progress: track.progress
              },
              error: false
            });
          } else {
            // Return error
            res.status(400).json({ message: 'State of package already exists', error: true });
          }
        });
    } else {
      // Returns {errors: [...]}
      res.status(400).json({ error: true, message: error.details.map(it => it.message)[0] });
    }
  });

router.route('/api/tracks')
  /**
   * Creates a track (for staff members)
   * Contains no authorization yet
   */
  .post((req, res) => {
    // Validate payload
    let {error, value} = Joi.validate(req.body, TrackSchema);

    // Check if validation is successful
    if (!error) {
      value.trackingNumber = generateTrackingNumber(
        value.senderPostCode,
        value.receiverPostCode,
        value.date,
        value.packageSize,
        value.isExpress
      );

      // Create object or return error
      Track
        .findOrCreate({
          where: value,
          defaults: {
            trackingNumber: value.trackingNumber
          }
        })
        .spread((track, created) => {
          if (created) {
            // On saved
            res.json({
              data: {
                trackingNumber: track.trackingNumber,
                senderPostCode: track.senderPostCode,
                receiverPostCode: track.receiverPostCode,
                date: track.date,
                packageSize: track.packageSize,
                isExpress: track.isExpress,
                packageStates: []
              },
              error: false
            });
          } else {
            // Return error
            res.status(400).json({ message: 'Track already exists', error: true });
          }
        });
    } else {
      // Returns {errors: [...]}
      res.status(400).json({ error: true, message: error.details.map(it => it.message)[0] });
    }
  })
  /**
   * Returns all tracks for staff members
   * Contains no authorization yet
   */
  .get((req, res) => {
    Track
      .findAll({
        include: { model: PackageState, as: 'packageStates' }
      })
      .then(data => {
        let tracks = data.map(track_ => {
          let track = track_.dataValues;
          return {
            trackingNumber: track.trackingNumber,
            senderPostCode: track.senderPostCode,
            receiverPostCode: track.receiverPostCode,
            date: track.date,
            packageSize: track.packageSize,
            isExpress: track.isExpress,
            packageStates: track.packageStates.map(state => state.dataValues)
          };
        });
        res.json({
          data: {
            tracks
          },
          error: false
        });
      });
  });

module.exports = router;
