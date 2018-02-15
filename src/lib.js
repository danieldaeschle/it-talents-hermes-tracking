const crc = require('crc');

function generateTrackingNumber(
  senderPostCode,
  receiverPostCode,
  date,
  packageSize,
  isExpress
) {
  // Hashing with crc32 (it is short)
  let code = parseInt(crc.crc32(
    senderPostCode.toString() +
    date.toString() +
    packageSize.toString() +
    isExpress.toString()
  ).toString(16), 16);

  // HMS (for Hermes) + code
  return 'HMS' + code
}

module.exports = {generateTrackingNumber};
