const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');

const secretKey = 'hvy)@0-@@c(3w$6b!9zj6!%n-u54lz*&f4@i(e_z76biofqoe1';
const router = express.Router();
const username = 'talent';
const password = 'iamnotsecret';
const AuthSchema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required()
});

router.route('/api/authenticate')
  .post((req, res) => {
    const { error, value } = Joi.validate(req.body, AuthSchema);
    if (!error) {
      if (value.password === password && value.username === username) {
        // generate token with jwt
        const token = jwt.sign({
          username: username,
          password: password
        }, secretKey, { expiresIn: 60 * 60 });  // 1 Hour expiration time
        res.json({ token });
      } else {
        res.status(401).json({ message: 'Wrong username or password', error: true });
      }
    } else {
      // Returns {message: ..., error: ...}
      res.status(400).json({ error: true, message: error.details.map(it => it.message)[0] });
    }
  });

function verify(token) {
  try {
    const decoded = jwt.verify(token, secretKey);
    return decoded;
  } catch(err) {
    return false;
  }
}

module.exports = { router, verify };
