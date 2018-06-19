const bcrypt = require('bcrypt');
const redis = require('redis');
 
 
var PersistService = class {
    constructor() {
        this.client = redis.createClient(
            process.env.REDIS_URL || 'redis://127.0.0.1:6379');
    }
 
    create_user(user, password,valido) {
        var self = this;
        let keys;
        let exists;
        let datos;
        let data;
        let map;
        this.get_all_users(
            function(err, reply) {
                keys = Object.keys(reply);
                datos = Object.values(reply);
                data = datos.map(function(element){
                    return JSON.parse(element);
                });
                map = keys.map( function(x, i){
                    return {"user": x, "passwd": data[i].password, "valido": data[i].valido};
                }.bind(this));
                map.forEach(function(element) {
                    if(element.user == user){
                       exists = 1;
                    }else{
                        exists = 0;
                    }
                });
            });
            if(exists == 0){
                return self.client.hlen('users', function(err, userlength) {
                    const valido = userlength == 0 ? '1' : '0';
                    bcrypt.hash(password, 10, function(err, hash){
                        self.client.hmset(
                            'users',
                            user,
                            JSON.stringify(
                                {'password': hash, 'valido': valido} ));
                    });
                });
            }else{
                return false;
            }
        
    }
 
    set_user(user, valido){
        var self = this;
        let keys;
        let password;
        let role;
        let datos;
        let data;
        let map;
        this.get_all_users(
            function(err, reply) {
                keys = Object.keys(reply);
                datos = Object.values(reply);
                data = datos.map(function(element){
                    return JSON.parse(element);
                });
                map = keys.map( function(x, i){
                    return {"user": x, "passwd": data[i].password, "valido": data[i].valido};
                }.bind(this));
                map.forEach(function(element) {
                    if(element.user == user){
                        password = element.passwd;
                        role = element.role;
                        self.client.hmset(
                            'users',
                                user,
                                JSON.stringify(
                                {'password': password, 'valido': valido } ));
                    }
                });
            });
    }
    validate_user(user){
        this.set_user(user, '1');
    }
    deny_user(user){
       this.set_user(user, '0');
    } 
    get_all_users(callback) {
        return this.client.hgetall('users', callback);
    }
}

module.exports = PersistService;