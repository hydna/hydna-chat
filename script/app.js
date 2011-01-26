$(document).ready(function() {
    var nick = nickgen();
    var chat = $('#chat');

    // open a stream to hydna in read/write mode
    var stream = new HydnaStream('flash.hydna.net:7010/437', 'rw', null, {
        transport: 'ws',
    });

    // draw figure when data is received over stream
    stream.onmessage = function(message) {
        var packet = JSON.parse(message);
        chat.chatMessage(packet.nick, packet.message);
        // scroll to bottom of chat. this could be disabled when the user
        // has manually scrolled.
        chat.attr('scrollTop', chat.attr('scrollHeight'));
    };

    stream.onerror = function(err) {
        chat.errorMessage('An error has occured. ' + err.error);
    };
    stream.onclose = function(err) {
        chat.infoMessage('Connection closed. Please reload page.');
    }

    // initiate paint when stream is ready.
    stream.onopen = function() {
        chat.infoMessage('You are now connected and will henceforth be known as "' + nick + '".');
    };

    $('#input input').focus();

    $('form').submit(function(event) {
        event.preventDefault();
        var input = $('input', this);
        if (input.val()) {
            stream.send(JSON.stringify({
                nick: nick,
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
        nick.push(pool[Math.floor(Math.random() * pool.length)]);
    }
    return nick.join('');
}

function time() {
    var d = new Date();
    return d.getHours() + ':' + d.getMinutes();
}

$.fn.chatMessage = function(nick, message) {
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

