$(document).ready(function() {
  var nick = nickgen();
  var chat = $('#chat');

  chat.infoMessage('Connecting ...');

  // open a channel to hydna in read/write mode.
  // NOTE: You must replace <simple-chat.hydna.net> with your actual domain
  // to be able to run this script.
  var channel = new HydnaChannel('simple-chat.hydna.net', 'rw');

  // handle packets as they are received over channel
  channel.onmessage = function(event) {
    // event.data should contain a JSON-encoded object. We'll decode it and
    // look at it's type to see what to do next.
    var packet = JSON.parse(event.data);
    switch(packet.type) {
      case 'join':
        chat.infoMessage(packet.nick + ' has entered the chat!');
        break;
      case 'msg':
        chat.chatMessage(packet.nick, packet.message);
        break;
    }
    // scroll to bottom of chat. this could be disabled when the user has
    // manually scrolled.
    chat.prop('scrollTop', chat.prop('scrollHeight'));
  };

  channel.onerror = function(err) {
    chat.errorMessage('An error has occured. ' + err.message);
  };

  channel.onclose = function(err) {
    chat.infoMessage('Connection closed. Please reload page.');
  }

  channel.onopen = function() {
    // we're connected and the channel is open. display a nice message and
    // broadcast this information to the channel.
    chat.infoMessage('You are now connected and will henceforth be known as "'
                     + nick + '".');
    channel.send(JSON.stringify({
      nick: nick,
      type: 'join'
    }));
  };

  $('#input input').focus();

  $('form').submit(function(event) {
    event.preventDefault();
    var input = $('input', this);
    if (input.val()) {
      channel.send(JSON.stringify({
        nick: nick,
        type: 'msg',
        message: input.val()
      }));

      // clear the input box after sending the message.
      input.val('');
    }
  });
});

// generate a random nickname.
function nickgen() {
  var consonants = 'bcddfghklmmnnprssttv';
  var vocals = 'aaeeiioouuy';
  var length = 4 + Math.floor(Math.random() * 4);
  var nick = [];
  var pool;
  for (var i = 0; i < length; i++) {
    pool = (i % 2 ? vocals : consonants);
    nick.push(pool.charAt(Math.floor(Math.random() * pool.length)));
  }
  return nick.join('');
}

// return the current time in a nice format
function time() {
  var d = new Date();
  var h = d.getHours();
  var m = d.getMinutes();
  return (h < 12?'0' + h:h) + ':' + (m < 10?'0' + m:m);
}

// append a chat message to an element
$.fn.chatMessage = function(nick, message) {
  // escape nicks and messages to prevent evil users from doing evil things
  nick = nick.replace(/<([^>]+)>/g,'');
  message = message.replace(/<([^>]+)>/g,'');
  $(this).append([
    '<p class="message">',
    '<span class="time">[',
      time(),
      ']</span>',
      '<span class="nick">',
      nick,
      ':</span>',
      message,
      '</p>'
      ].join(''));
};

// append an info message to an element
$.fn.infoMessage = function(message) {
  message = message.replace(/<([^>]+)>/g,'');
  $(this).append([
    '<p class="info">',
    '<span class="prefix">★</span>',
    message,
    '</p>'
    ].join(''));
};

// append an error message to an element
$.fn.errorMessage = function(message) {
  $(this).append([
    '<p class="error">',
    '<span class="prefix">✗</span>',
    message,
    '</p>'
    ].join(''));
};
