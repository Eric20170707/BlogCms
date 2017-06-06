const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;//策略
const db = require('./db');

module.exports.init=function () {
    //console.log('passport.local.init');

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },function(email, password, done) {
        //console.log('passport.local.find: ', email);这里的字段名称应该是页面表单提交的名称，即req.body.xxx，而不是user数据库中的字段名称。

        db.User.findOne({ email: email }, function (err, user) {
            //console.log('passport.local.find: ', user, err);

            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);//用户不存在
            }
            if (!user.verifyPassword(password)) {//密码不匹配
                return done(null, false);
            }
            return done(null, user);
        });
    }));

	//session对象序列化
    passport.serializeUser(function(user, done) {
        //console.log('passport.local.serializeUser: ', user);
//将环境中的user.id序列化到session中，即sessionID，同时它将作为凭证存储在用户cookie中。
        done(null, user._id);
    });

	//session对象反序列化
    passport.deserializeUser(function(id, done) {
        //console.log('passport.local.deserializeUser: ', id);
//参数为用户提交的sessionID，若存在则从数据库中查询user并存储与req.user中。
        db.User.findById(id, function (err, user) {
            done(err, user);
        });
    });
};