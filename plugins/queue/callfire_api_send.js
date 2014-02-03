var callfire = require('callfire');

exports.register = function() {
    this.register_hook('queue', 'hook_queue');
    this.register_hook('queue_outbound', 'hook_queued');
}

exports.hook_queue = function (next, connection) {
    var username = connection.notes.callfire.username;
    var password = connection.notes.callfire.password;
    var request = {};
    var text_client = callfire(username, password, 'Text');
    
    if(username === undefined || password === undefined) {
        return next(DENY, 'You have not authenticated using CallFire API credentials');
    }
    
    request.type = callfire.BROADCAST_TEXT;
    request.to = connection.transaction.rctp_to.user;
    request.message = connection.transaction.body.bodytext;
    
    if(callfire.is_phone_number(connection.transaction.mail_from.user)) {
        request.from = connection.transaction.mail_from.user;
    }
    
    text_client.SendText(request, function(response) {
        var resource = text_client.response(response);
    
        if(resource !== undefined) {
            if(resource.id !== undefined) {
                next(OK, 'Message delivered with message ID ' + resource.id);
            } else if(resource.httpStatus !== undefined) {
                next(DENY, 'Message could not be delivered: [' + resource.httpStatus + '] ' + resource.message);
            } else {
                next(DENY);
            }
        } else {
            next(DENY);
        }
    }, function() {
        next(DENYSOFT, 'Sending failed due to service error');
    });
}
