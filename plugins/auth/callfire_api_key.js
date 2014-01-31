var callfire = require('callfire');

exports.register = function() {
    this.inherits('auth/auth_base');
}

exports.hook_capabilities = function (next, connection) {
    connection.capabilities.push('AUTH PLAIN LOGIN');
    connection.notes.allowed_auth_methods = ['PLAIN', 'LOGIN'];
    connection.notes.callfire = {
        username: undefined,
        password: undefined
    }
    next();
}

exports.check_plain_passwd = function (connection, user, passwd, cb) {
    callfire.verify_credentials(user, passwd, function(success) {
        if(success) {
            connection.notes.callfire.username = user;
            connection.notes.callfire.password = passwd;
        }
    
        return cb(success);
    }, function() {
        return cb(false);
    });
}
