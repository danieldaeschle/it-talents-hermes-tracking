window.onload = function() {
  var track = document.getElementById('track');
  var snackbar = document.getElementById('snackbar');

  track.onsubmit = function() {
    var trackingNumber = track.trackNumber.value;
    if (trackingNumber) {
      aja()
        .url('/api/tracks/' + trackingNumber)
        .on('200', function (data) {
          setupProgressCard(data);
        })
        .on('40x', function(data) {
          data = JSON.parse(data);
          snackbar.MaterialSnackbar.showSnackbar({
            message: data.message,
            timeout: 2000
          });
        })
        .go();
    }
    track.reset();
    return false;
  }
}

function setupProgressCard(data) {
  var date = new Date(data.date).toLocaleString();

  // Set content
  document.getElementById('date').innerText = date;
  document.getElementById('trackingNumber').innerText = data.trackingNumber;
  document.getElementById('senderPostCode').innerText = data.senderPostCode;
  document.getElementById('receiverPostCode').innerText = data.receiverPostCode;
  document.getElementById('packageSize').innerText = data.packageSize;
  document.getElementById('isExpress').innerText = data.isExpress ? 'Ja' : 'Nein';
  document.getElementById('progressCard').style.display = 'block';

  // Reset colors
  var state1 = document.getElementById('state-1');
  var state2 = document.getElementById('state-2');
  var state3 = document.getElementById('state-3');
  var state4 = document.getElementById('state-4');
  state1.style.backgroundColor = '#E0E0E0';
  state2.style.backgroundColor = '#E0E0E0';
  state3.style.backgroundColor = '#E0E0E0';
  state4.style.backgroundColor = '#E0E0E0';

  // Default -> always on state 0
  document.getElementById('state-0').style.backgroundColor = '#81C784';

  // Setting colors for states
  data.packageStates.forEach(function(state) {
    document.getElementById('state-' + state.progress)
      .style
      .backgroundColor = '#81C784';
  });
}
