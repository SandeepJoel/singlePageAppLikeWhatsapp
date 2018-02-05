// (function(){
  User='';
  var element = function(id){
      return document.getElementById(id);
  }

  var qs = function(selector){
    return document.querySelector(selector);
  }

  // Get Elements
  var statusMessage = element('status-message');
  /*
    Using 'statusMessage' instead of 'status'
    investigate why 'status' variable clashes with socket.on('status',func(){})
    does it set any value to status variable
  */
  var messages = element('messages');
  var textarea = element('textarea');
  var loginBtn = element('login-button');
  var app = element('app');
  var login = element('login');
  var userDisplayName = element('user');
  var usersList = element('users-list');
  var signOutBtn = element('signout');
  var sendBtn = element('send-message');
  var searchInput = element('search');

  showApp = function() {
    app.classList.remove('hide');
  }

  hideApp = function() {
    app.classList.add('hide');
  }

  hideLogin = function() {
    login.classList.add('hide');
  }

  showLogin = function() {
    login.classList.remove('hide');
  }

  if (document.cookie.split('mongo_chat_user=')[1]) {
    window.User = document.cookie.split('mongo_chat_user=')[1];
    showApp();
    displayFriends();
    displayCurrentUserName();
    setStatus('');
  } else {
    showLogin();
  }

  clearChildren(messages);

  // Set status
  function setStatus (s) {
    statusMessage.textContent = s;
  };

  // to clear all child nodes of the passed node
  function clearChildren (node) {
    while(node.firstChild){
      node.removeChild(node.firstChild);
    }
  }

  // function to handle login submission
  function loginHandler () {
    userName = qs('input[name=user_name]').value;
    password = qs('input[name=password]').value;
    axios.post('/api/login',{
      userName: userName,
      password: password
    })
    .then(function(response){
      if(response.data.success) {
        hideLogin();
        window.User = userName;
        displayCurrentUserName();
        displayFriends();
        showApp();
      }
    })
    .catch(function(error){
      throw error
    });
  };

  function displayFriends() {
    clearChildren(usersList);
    axios.post('/api/fetch_users')
    .then(function(response) {
      if (response.data.users) {
        response.data.users.forEach(function(individual_user){
          if (individual_user.name !== window.User) {
            let userLink = document.createElement('a');
            userLink.setAttribute('class', 'switch-rooms');
            userLink.setAttribute('href', '#');
            userLink.appendChild(document.createTextNode(individual_user.name));
            usersList.appendChild(userLink);
          }
        });
      }
    })
    .catch(function(error){
      throw error
    });
  }

  function displayCurrentUserName() {
    userDisplayName.innerHTML = window.User;
  }

  function appendMessagesToBox(data) {
    var div = document.createElement('div');
    div.setAttribute('class', 'chat');
    var nameDiv = document.createElement('div');
    nameDiv.setAttribute('class', 'user-name');
    nameDiv.appendChild(document.createTextNode(data.name));
    div.appendChild(nameDiv);

    var messageDiv = document.createElement('div');
    messageDiv.setAttribute('class', 'user-message');
    messageDiv.appendChild(document.createTextNode(data.message));
    div.appendChild(messageDiv);
    messages.appendChild(div);
  }

  function sendMessage () {
    // Emit to server input -- only when 'Friend is selected', Cookie is set and Textarea has value
    if (document.getElementsByClassName('active')[0] && window.User && textarea.value !== '') {
      socket.emit('roomchat-input', {
          name: window.User,
          message: textarea.value
      });
      textarea.value = '';
    } else {
      setStatus('Please select a friend to chat');
    }
    event.preventDefault();
  }

  loginBtn.addEventListener('click', loginHandler);
  qs('input[name=password]').addEventListener('keydown', function (event){
    if(event.which === 13 && event.shiftKey == false) {
      loginHandler();
    }
  });

  signOutBtn.addEventListener('click', function(){
    axios.post('/api/signout')
    .then(function(response){
      if(response.data.success && response.data.message) {
        window.User = ''
        hideApp();
        showLogin();
      }
    })
    .catch(function(error){
      throw error
    });

  });

  // Connect to socket.io
  var socket = io();

  // Check for connection
  if(socket !== undefined){
      // Handle Output
      socket.on('connect', function(){
          console.log('Socket ' + socket.id + ' is trying to connect');
      });

      // when to emit "update-room"
      roomListWrapper = element('users-list');
      roomListWrapper.addEventListener('click', function(event) {
        if (event.target && event.target.className === 'switch-rooms'){
          roomsList = Array.from(document.getElementsByClassName('switch-rooms'));
          roomsList.forEach( function(item){
            item.classList.remove('active')
          });
          event.target.classList.add('active');
          selectedFriend = document.getElementsByClassName('active')[0].innerHTML.trim();
          setStatus(`Friend '${selectedFriend}' is selected`);
          var roomData = {
              'friend': selectedFriend,
              'user': window.User
          }
          socket.emit('update-room', roomData);
        }
      });

      // Get Status From Server
      socket.on('status', function(data){
          // get message status
          // setStatus((typeof data === 'object')? data.message : data);
      });

      socket.on('roomchat-output', function(data){
          appendMessagesToBox(data);
      });

      socket.on('message-history', function(data) {
        if(data['message-history']) {
          clearChildren(messages);
          data['message-history'].forEach(function(item) {
            appendMessagesToBox(item);
          });
        }
      })

      // Handle Input
      textarea.addEventListener('keydown', function (event) {
          if(event.which === 13 && event.shiftKey == false) {
            sendMessage();
          }
      });
      sendBtn.addEventListener('click', sendMessage);
  }
// })();
