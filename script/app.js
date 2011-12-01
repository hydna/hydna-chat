$(document).ready(function() {
    var nick = nickgen();
    var chat = $('#chat');

    // open a stream to hydna in read/write mode
    var stream = new HydnaChannel('demo.hydna.net/2222', 'rw');

    // draw figure when data is received over stream
    stream.onmessage = function(message) {
        var packet = JSON.parse(message);
        switch(packet.type) {
        case 'join':
            chat.infoMessage(packet.nick + ' has entered the chat!');
            break;
        case 'msg':
            chat.chatMessage(packet.nick, packet.message);
            break;
        }
        // scroll to bottom of chat. this could be disabled when the user
        // has manually scrolled.
        chat.attr('scrollTop', chat.attr('scrollHeight'));
    };

    stream.onerror = function(err) {
        chat.errorMessage('An error has occured. ' + err.message);
    };
    stream.onclose = function(err) {
        chat.infoMessage('Connection closed. Please reload page.');
    }

    // initiate paint when stream is ready.
    stream.onopen = function() {
        chat.infoMessage('You are now connected and will henceforth be known as "' + nick + '".');
        stream.send(JSON.stringify({
            nick: nick,
            type: 'join'
        }));
    };

    $('#input input').focus();

    $('form').submit(function(event) {
        event.preventDefault();
        var input = $('input', this);
        if (input.val()) {
            stream.send(JSON.stringify({
                nick: nick,
                type: 'msg',
                message: input.val()
            }));
            input.val('');
        }
    });
});

function nickgen() {
    var consonants = 'bcddfghklmmnnprssttv';
    var vocals = 'aaeeiioouuy';
    var length = 4 + Math.floor(Math.random() * 4);
    var nick = [];
    var pool;
    for (var i = 0; i < length; i++) {
        pool = (i % 2?vocals:consonants);
        nick.push(pool.charAt(Math.floor(Math.random() * pool.length)));
    }
    return nick.join('');
}

function time() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    return (h < 12?'0' + h:h) + ':' + (m < 10?'0' + m:m);
}

$.fn.chatMessage = function(nick, message) {
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

$.fn.infoMessage = function(message) {
    $(this).append([
        '<p class="info">',
        '<span class="prefix">≡</span>',
        message,
        '</p>'
    ].join(''));
};

$.fn.errorMessage = function(message) {
    $(this).append([
        '<p class="error">',
        '<span class="prefix">≡</span>',
        message,
        '</p>'
    ].join(''));
};

