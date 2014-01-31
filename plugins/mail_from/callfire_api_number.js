var callfire = require('callfire');

exports.register = function() {
    this.register_hook('mail', 'mail_from_access');
}

exports.mail_from_access = function (next, connection, params) {
    var mail_from = params[0].address();
    var number = mail_from.user;
    var username = connection.notes.callfire.username;
    var password = connection.notes.callfire.password;
    
    if(username === undefined || password === undefined) {
        return next(DENY, 'You have not authenticated using CallFire API credentials');
    }
    
    if(callfire.is_phone_number(number)) {
        callfire.number.get_number(username, password, number, function(number) {
            if(number !== undefined && number.status == 'ACTIVE') {
                return next();
            } else {
                return next(DENY, 'You are not authorized to send on the specified number');
            }
        });
    } else {
        return next();
    }
}
