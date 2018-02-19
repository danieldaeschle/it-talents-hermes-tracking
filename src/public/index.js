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
  var date = new Date(data.date);
  var history = document.getElementById('history');
  var state0 = document.getElementById('state-0')
  var state1 = document.getElementById('state-1');
  var state2 = document.getElementById('state-2');
  var state3 = document.getElementById('state-3');
  var state4 = document.getElementById('state-4');
  var historyContent = '<tr><td>'+date.toLocaleDateString()+'</td>'+
    '<td>'+data.senderPostCode+'</td><td><div>Paket wurde an der Poststelle abgegeben</div></td></tr>';
  

  // Set content
  document.getElementById('date').innerText = date.toLocaleString();
  document.getElementById('trackingNumber').innerText = data.trackingNumber;
  document.getElementById('senderPostCode').innerText = data.senderPostCode;
  document.getElementById('receiverPostCode').innerText = data.receiverPostCode;
  document.getElementById('packageSize').innerText = data.packageSize;
  document.getElementById('isExpress').innerText = data.isExpress ? 'Ja' : 'Nein';
  document.getElementById('progressCard').style.display = 'block';

  // Reset colors
  state1.style.backgroundColor = '#E0E0E0';
  state2.style.backgroundColor = '#E0E0E0';
  state3.style.backgroundColor = '#E0E0E0';
  state4.style.backgroundColor = '#E0E0E0';

  // Default -> always on state 0
  state0.style.backgroundColor = '#81C784';

  // Sort state
  // Setting colors for states
  // Adding messages to message list
  data.packageStates.sort(function(stateA, stateB) {
    return stateA.progress - stateB.progress;
  }).forEach(function(state) {
    var timestamp = new Date(state.timestamp);
    document.getElementById('state-' + state.progress)
      .style
      .backgroundColor = '#81C784';
    historyContent += '<tr><td>' + timestamp.toLocaleDateString() + '</td>' +
      '<td>' + state.locationPostCode + '</td><td><div>' + (state.message ? state.message : '') + '</div></td></tr>';
  });
  history.innerHTML = historyContent;
}
