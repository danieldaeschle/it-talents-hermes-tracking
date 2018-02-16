var track = document.getElementById('track');
track.onsubmit = function () {
  var trackingNumber = track.trackNumber.value;
  if (trackingNumber) {
    aja()
      .url('/api/tracks/' + trackingNumber)
      .on('success', function (data) {
        var date = new Date(data.date).toLocaleString();
        document.getElementById('date').innerText = date;
        document.getElementById('trackingNumber').innerText = data.trackingNumber;
        document.getElementById('senderPostCode').innerText = data.senderPostCode;
        document.getElementById('receiverPostCode').innerText = data.receiverPostCode;
        document.getElementById('packageSize').innerText = data.packageSize;
        document.getElementById('isExpress').innerText = data.isExpress ? 'Ja' : 'Nein';
        document.getElementById('progressCard').style.display = 'block';
      })
      .go();
  }
  track.reset();
  return false;
}