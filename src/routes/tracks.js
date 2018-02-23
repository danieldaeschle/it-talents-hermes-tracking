const express = require('express');
const Joi = require('joi');

const { Track, TrackSchema, PackageState, PackageStateSchema } = require('../models');
const { generateTrackingNumber } = require('../lib');
const { verify } = require('./authenticate');

const router = express.Router();

router.route('/api/tracks/:trackingId')
  /**
   * Returns on track by tracking id
   */
  .get((req, res) => {
    const id = req.params.trackingId;

    // search in database
    Track.findOne({
      where: { trackingNumber: id },
      include: { model: PackageState, as: 'packageStates' }
    }).then(track => {
      if (track) {
        track = track.dataValues;
        // change package state data from database result
        track.packageStates = track.packageStates
          .map(state => {
            return {
              progress: state.progress,
              locationPostCode: state.locationPostCode,
              message: state.message,
              timestamp: state.createdAt
            };
          });

        // return result
        res.json({
          data: {
            trackingNumber: track.trackingNumber,
            senderPostCode: track.senderPostCode,
            receiverPostCode: track.receiverPostCode,
            date: track.date,
            packageSize: track.packageSize,
            isExpress: track.isExpress,
            packageStates: track.packageStates
          },
          error: false
        });
      } else {
        res.status(404).json({ message: 'Tracking number doesn\'t exists', error: true });
      }
    });
  })
  /**
   * Creates a track state by tracking id
   */
  .post((req, res) => {
    const id = req.params.trackingId;

    // Validate payload
    const {error, value} = Joi.validate(req.body, PackageStateSchema);
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
        .spread((state, created) => {
          if (created) {
            state = state.dataValues;
            // On saved
            res.json({
              data: {
                locationPostCode: state.locationPostCode,
                message: state.message,
                progress: state.progress,
                timestamp: state.createdAt
              },
              error: false
            });
          } else {
            // Return error
            res.status(400).json({ message: 'State of package already exists', error: true });
          }
        });
    } else {
      // Returns {message: ..., error: ...}
      res.status(400).json({ error: true, message: error.details.map(it => it.message)[0] });
    }
  })
  /**
   * Removes a item from database
   * Only for staff members (no authenticated yet)
   */
  .delete((req, res) => {// Check token
    const token = req.get('X-Access-Token');
    const authorized = verify(token);

    if (authorized) {
      const id = req.params.trackingId;

      Track
        .destroy({
          where: {
            trackingNumber: id
          }
        })
        .then(result => {
          if (result === 1) {
            res.json({ message: 'Track has been deleted', error: false });
          } else if (result === 0) {
            res.status(404).json({ message: 'Track with trackingNumber \''+id+'\' doesn\'t exist', error: true });
          } else {
            res.status(500).json({ message: 'An unknown error occured', error: true });
          }
        });
    } else {
      // Not authorized
      res.status(401).json({ message: 'You are not authorized to do this action', error: true });
    }
  });

router.route('/api/tracks')
  /**
   * Creates a track (for staff members)
   * Contains no authorization yet
   */
  .post((req, res) => {
    // Check token
    const token = req.get('X-Access-Token');
    const authorized = verify(token);

    if (authorized) {
      // Validate payload
      const { error, value } = Joi.validate(req.body, TrackSchema);

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
        // Returns {message: ..., error: ...}
        res.status(400).json({ error: true, message: error.details.map(it => it.message)[0] });
      }
    } else {
      // Not authorized
      res.status(401).json({ message: 'You are not authorized to do this action', error: true });
    }
  })
  /**
   * Returns all tracks for staff members
   * Contains no authorization yet
   */
  .get((req, res) => {
    const token = req.get('X-Access-Token');
    const authorized = verify(token);

    if (authorized) {
      Track
        .findAll({
          include: { model: PackageState, as: 'packageStates' }
        })
        .then(data => {
          const tracks = data.map(track_ => {
            const track = track_.dataValues;
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
            data: tracks,
            error: false
          });
        });
    } else {
      // Not authorized
      res.status(401).json({ message: 'You are not authorized to do this action', error: true });
    }
  });

module.exports = router;
