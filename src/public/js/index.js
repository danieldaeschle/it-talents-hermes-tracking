// own scope (token is save then)
var token = localStorage.getItem('token') || '';

window.onload = function () {
  // User page
  var track = document.getElementById('track');
  var snackbar = document.getElementById('snackbar');

  track.onsubmit = function () {
    var trackingNumber = track.trackNumber.value;
    if (trackingNumber) {
      // Fetch a single track
      aja()
        .url('/api/tracks/' + trackingNumber)
        .on('200', function (data) {
          setupProgressCard(data.data);
        })
        .on('40x', function (data) {
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

  // ----- Staff page ------

  // Get all tracks
  fetchPackageList();

  var addPackageDialog = document.getElementById('add-package');
  var addPackageButton = document.getElementById('add-package-button');
  var form = this.document.getElementById('add-package-form');
  var newDate = document.getElementById('new-date');
  var newSender = document.getElementById('new-sender-code');
  var newReceiver = document.getElementById('new-receiver-code');
  var newSize = document.getElementById('new-package-size');
  var express = document.getElementById('new-express');
  if (!addPackageDialog.showModal) {
    dialogPolyfill.registerDialog(addPackageDialog);
  }
  addPackageButton.addEventListener('click', function () {
    newDate.value = new Date().toISOString();
    addPackageDialog.showModal();
  });
  addPackageDialog.querySelector('.close').addEventListener('click', function () {
    addPackageDialog.close();
    form.reset();
  });
  form.onsubmit = function () {
    addPackageDialog.close();
    var newPackage = {
      senderPostCode: newSender.value,
      receiverPostCode: newReceiver.value,
      date: newDate.value,
      packageSize: newSize.value,
      isExpress: express.checked,
    };
    // Create new track on server
    aja()
      .method('POST')
      .url('/api/tracks')
      .body(newPackage)
      .on('200', function (data) {
        addTrackToList(data.data);
      })
      .on('40x', function (data) {
        data = JSON.parse(data);
        snackbar.MaterialSnackbar.showSnackbar({
          message: data.message,
          timeout: 2000
        });
      })
      .go();
    form.reset();
    return false;
  }

  // Setup -> Update state dialog
  var stateDialog = document.getElementById('update-state');
  var stateForm = document.getElementById('state-form');
  var stateTrackId = document.getElementById('state-track-id');
  var stateMessage = document.getElementById('state-message');
  var stateNextState = document.getElementById('state-next-state');
  var stateLocationCode = document.getElementById('state-location-code');

  if (!stateDialog.showModal) {
    dialogPolyfill.registerDialog(stateDialog);
  }
  stateDialog.querySelector('.close').addEventListener('click', function () {
    stateDialog.close();
    stateForm.reset();
  });

  stateForm.onsubmit = function () {
    var trackingId = stateTrackId.value;
    var newState = {
      message: stateMessage.value,
      progress: stateNextState.value,
      locationPostCode: stateLocationCode.value
    };

    aja()
      .header('X-Access-Token', token)
      .method('POST')
      .url('/api/tracks/' + trackingId)
      .body(newState)
      .on('200', function (data) {
        snackbar.MaterialSnackbar.showSnackbar({
          message: 'Erfolgreich geändert',
          timeout: 2000
        });
        // Replace current list with the new data
        fetchPackageList();
      })
      .on('40x', function (data) {
        data = JSON.parse(data);
        snackbar.MaterialSnackbar.showSnackbar({
          message: data.message,
          timeout: 2000
        });
      })
      .go();

    stateDialog.close();
    stateForm.reset();
    return false;
  }
}

// requires auth
function fetchPackageList() {
  aja()
    .header('X-Access-Token', token)
    .url('/api/tracks')
    .on('200', function (data) {
      setupPackageList(data.data);
    })
    .on('401', function (data) {
      showLogin();
    })
    .go();
}

function showLogin() {
  var loginForm = document.getElementById('login-form');
  var username = document.getElementById('username');
  var password = document.getElementById('password');
  var loginCard = document.getElementById('login');
  var packageList = document.getElementById('package-list');

  // hide package list and show login
  loginCard.style.display = 'block';
  packageList.style.display = 'none';

  loginForm.onsubmit = function () {
    aja()
      .url('/api/authenticate')
      .method('POST')
      .body({ username: username.value, password: password.value })
      .on('200', function (data) {
        // set token
        token = data.token;
        localStorage.setItem('token', token);
        // hide login show package list
        loginCard.style.display = 'none';
        packageList.style.display = 'block';

        // fetch package list
        fetchPackageList();
      })
      .on('40x', function (data) {
        data = JSON.parse(data);
        snackbar.MaterialSnackbar.showSnackbar({
          message: data.message,
          timeout: 2000
        });
      })
      .go();
    loginForm.reset();
    return false;
  }
}

// On update state dialog button click
function updateState(track) {
  var stateDialog = document.getElementById('update-state');
  var stateNextState = document.getElementById('state-next-state');
  var stateTrackId = document.getElementById('state-track-id');
  stateTrackId.value = track.trackingNumber;
  stateNextState.value = Math.max(...track.packageStates.map(function (it) {
    return it.progress;
  }), 0) + 1;
  stateDialog.showModal();
}

// on delete package dialog button click
function deletePackage(id) {
  // show modal
  var idHolder = document.getElementById('remove-track-id');
  var removeDialog = document.getElementById('remove-package');
  var submitButton = removeDialog.querySelector('.submit');
  var closeButton = removeDialog.querySelector('.close');
  idHolder.value = id;
  submitButton.addEventListener('click', function () {
    var id = idHolder.value;
    aja()
      .method('DELETE')
      .url('/api/tracks/' + id)
      .header('X-Access-Token', token)
      .on('200', function (data) {
        fetchPackageList();
        snackbar.MaterialSnackbar.showSnackbar({
          message: data.message,
          timeout: 2000
        });
      })
      .on('40x', function (data) {
        data = JSON.parse(data);
        snackbar.MaterialSnackbar.showSnackbar({
          message: data.message,
          timeout: 2000
        });
      })
      .go();
    removeDialog.close();
  });
  closeButton.addEventListener('click', function () {
    removeDialog.close();
  });
  removeDialog.showModal();
}

function setupProgressCard(data) {
  var date = new Date(data.date);
  var history = document.getElementById('history');
  var state0 = document.getElementById('state-0')
  var state1 = document.getElementById('state-1');
  var state2 = document.getElementById('state-2');
  var state3 = document.getElementById('state-3');
  var state4 = document.getElementById('state-4');
  var historyContent = '<tr><td>' + date.toLocaleDateString() + '</td>' +
    '<td>' + data.senderPostCode + '</td><td><div>Paket wurde an der Poststelle abgegeben</div></td></tr>';


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
  data.packageStates.sort(function (stateA, stateB) {
    return stateA.progress - stateB.progress;
  }).forEach(function (state) {
    var timestamp = new Date(state.timestamp);
    document.getElementById('state-' + state.progress)
      .style
      .backgroundColor = '#81C784';
    historyContent += '<tr><td>' + timestamp.toLocaleDateString() + '</td>' +
      '<td>' + state.locationPostCode + '</td><td><div>' + (state.message ? state.message : '') + '</div></td></tr>';
  });
  history.innerHTML = historyContent;
}

function setupPackageList(data) {
  var packageListContainer = document.getElementById('package-list-container');
  packageListContainer.innerHTML = '';
  //packageListContainer.innerHTML += listItem;
  data.forEach(function (track) {
    addTrackToList(track);
  });
}

function addTrackToList(track) {
  var packageListContainer = document.getElementById('package-list-container');
  // Format HTML item which will be inserted into the page
  var listItem = '<li class="mdl-list__item mdl-list__item--three-line" id="' + track.trackingNumber + '">' +
    '<span class="mdl-list__item-primary-content">' +
    '<span>' + track.trackingNumber + '</span>' +
    '<span class="mdl-list__item-text-body">' +
    'Datum: ' + new Date(track.date).toLocaleDateString() +
    '<br>Sender: ' + track.senderPostCode +
    '<br>Empfänger: ' + track.receiverPostCode +
    '<br>Aktueller Status: ' + Math.max(...track.packageStates.map(function (it) {
      return it.progress;
    }), 0) +
    '</span>' +
    '</span>' +
    '<span class="mdl-list__item-secondary-content">' +
    '<button onclick="deletePackage(\'' + track.trackingNumber + '\')" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">' +
    '<i class="material-icons">close</i>' +
    '</button>' +
    '<button onclick="updateState(' +
    JSON.stringify(track).split('"').join('\'') +
    ')" class="mdl-button mdl-js-button mdl-button--icon mdl-button--colored">' +
    '<i class="material-icons">edit_mode</i>' +
    '</button>' +
    '</span>' +
    '</li>';
  packageListContainer.innerHTML += listItem;
}
