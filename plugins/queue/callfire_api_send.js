var callfire = require('callfire');

exports.hook_queue = function (next, connection) {
    var username = connection.notes.callfire.username;
    var password = connection.notes.callfire.password;
    var request = {};
    
    if(username === undefined || password === undefined) {
        return next(DENY, 'You have not authenticated using CallFire API credentials');
    }
    
    request.type = callfire.BROADCAST_TEXT;
    request.to = connection.transaction.rctp_to.user;
    request.message = connection.transaction.body;
    
    if(callfire.is_phone_number(connection.transaction.mail_from.user)) {
        request.from = connection.transaction.mail_from.user;
    }
    
    callfire.text.send_text(username, password, request, function(resource, exception) {
        if(resource !== undefined) {
            next(OK, 'Message delivered with message ID ' + resource.id);
        } else {
            next(DENY, 'Message could not be delivered: [' + exception.http_status + '] ' + exception.message);
        }
    }, function() {
        next(DENYSOFT, 'Sending failed due to service error');
    });
}
