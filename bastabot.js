#!/usr/bin/env node
var classifier = require("classifier"),
    irc = require("irc"),
    url = require("url"),
    options = {
        host: process.env.HOST || "irc.mozilla.org",
        nick: process.env.NICK || "bastabot",
        channels: process.env.CHANNELS || "#bots,#dangerzone",
        redis: url.parse(process.env.REDISTOGO_URL ||
                         process.env.REDIS ||
                         "redis://localhost:6379")
    }
    lastLine = {};

var bayes = new classifier.Bayesian({
    backend: {
        type: "redis",
        options: {
            hostname: options.redis.hostname,
            name: "bastabot",
            password: options.redis.password,
            port: options.redis.port
        }
    },
    thresholds: {
        fine: 3,
        notfine: 1
    },
    def: "notfine"
});

var CHANNELS = options.channels.split(',');
CHANNELS.forEach(function(channel, i) {
    CHANNELS[i] = (channel[0] != '#' ? '#' : '') + channel.trim();
});

var client = new irc.Client(options.host, options.nick, {
    channels: CHANNELS
});

client.addListener("error", function(msg) {
    console.log(msg);
});

client.addListener("message", function(from, target, message) {
    var target, isChannel = false;

    // ignore DMs
    if (target.indexOf("#") != 0) {
        return;
    }

    // general chatter
    if (message.indexOf(options.nick) != 0) {
        lastLine[target] = message;
        bayes.classify(message, function(category) {
            if (category == "fine") {
                client.say(target, "It's fine");
            }
        });
        return;
    }

    // below are messages targeted at bastabot

    // negative reinforcement
    // will catch "no", "not fine", and more
    if (message.match(/no/i)) {
        if (lastLine[target]) {
            bayes.train(lastLine[target], "notfine", function() {
                client.say(target, "whatever");
            });
        }
        return;
    }

    if (message.match(/fine/i) || message.match(/whatever/i)) {
        if (lastLine[target]) {
            bayes.train(lastLine[target], "fine", function() {
                client.say(target, "It's whatever. It's fine");
            });
        }
        return;
    }

    // silent reinforcement
    if (message.match(/lol/i)) {
        if (lastLine[target]) {
            bayes.train(lastLine[target], "fine", function() {});
        }
        return
    }

    if (message.match(/botsnack/i)) {
        client.say(target, "nom nom nom");
    }

    // forced learning
    if (message.match(/".*" is fine/i)) {
        phrase = message.match(/".*"/i)[0].slice(1, -1);
        bayes.train(phrase, "fine", function() {
            client.say(target, "ok!");
        });
    }
});

// blindly follow invites
client.addListener("invite", function(channel, from) {
    client.join(channel, function() {
        client.say(from, "Joined " + channel);
    });
});
