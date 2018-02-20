const crc = require('crc');

function generateTrackingNumber(
  senderPostCode,
  receiverPostCode,
  date,
  packageSize,
  isExpress
) {
  // Splitted id in two hashes for a longer tracking number -> more available tracking numbers
  // Hashing with crc32 (it is short)

  // First code
  let code1 = parseInt(crc.crc32(
    senderPostCode.toString() +
    date.toString()
  ).toString(16), 16);

  // Second code
  let code2 = parseInt(crc.crc32(
    packageSize.toString() +
    isExpress.toString()
  ).toString(16), 16);

  // HMS (for Hermes) + code1 + code2
  return 'HMS' + code1.toString() + code2.toString();
}

module.exports = {generateTrackingNumber};
