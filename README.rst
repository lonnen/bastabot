========
BastaBot
========

A bot promoting a culture of relentless optimism.


Requirements
============

* Node_. I'm running 0.4.5. I assume anything that supports the libraries will
  work.

* Npm_. Then install the dependencies with:

    npm install .

* Redis_. I'm running 2.2.5. Any 2.2.x or higher is probably fine.

* IRC mates that won't kill you.

.. _Node: http://nodejs.org/
.. _Redis: http://redis.io/
.. _Npm: http://npmjs.org/



Running
=======

Start bastabot from the command line::

    $ node main.js

Bastabot looks for configuration in the environment. Below they config keys are listed with their defaults::

    HOST        irc.mozilla.org
    NICK        bastabot
    CHANNELS    #bots, #dangerzone

    REDISTOGO_URL or REDIS
                redis://localhost:6379

At a minimum, you'll probably want to specify an IRC server and some channels to join.

bastabot doesn't detach from the terminal or anything fancy like that, and the
error handling is *probably* robust enough to keep anything horrible from
happening.

Daemonize it with forever_ or supervisord_.

.. _forever: https://github.com/indexzero/forever
.. _supervisord: http://supervisord.org/


Training
========

The most important part is training. Bastabot will initially interject seemingly at random.

If bastabot was appropriately reassuring, respond with "lol", "whatever", or "it's fine" to encourage it. "lol" will not elicit a response from bastabot, but the other two will. For example::

    <foo> master02 is down
    <foo> bastabot: it's fine
    <bastabot> It's whatever. It's fine

bastabot has just trained "master02 is down" as an example of "fine". The next time someone says "master02 is down" (or something similiar, this is Bayesian) you'll probably see::

    <foo> stage is down
    <bastabot> It's fine

If bastabot is off base, you can tell it "no", or "not fine" to discourage it::

    <foo> where was that gif from?
    <bastabot> It's fine
    <foo> bastabot: notfine
    <bastabot> whatever

Now bastabot is less likely to respond to "where was that gif from?" and similar.

You can train bastabot by responding to it as if it had responded to things. If it should have responded or not responded to something, tell it "fine" or "notfile". You can also train it explicity by telling it something is fine directly::

    <foo> bastabot: everything is fine
    <bastabot> It's whatever. It's fine


Using Bootstrap Data
====================

It can take a while to train bastabot, especially if you don't have time to sit
there and teach it. Right now there is no training data, but there is a mechanism to serialize and load it once we get a bot trained up.

There is a simple script that can load or dump the data from Redis.

The data is in ``itsfine.json``, and the script to load it is ``data.js``. Run
``node data.js -h`` to get all the options, then do one of the following::

    # Load data into Redis.
    node data.js [options] load

    # Dump data to JSON.
    node data.js [options] dump


Sharing Training Data
---------------------

Multiple instances of bastabot can share the same Redis backend, so they can
share training data and learn together.


.. _TODO:

TODO
====

* populate itsfine.json with training data

* dynamic responses. interchange "whatever" and "it's fine". respond to either of those with a random chance that tends to lead to a short chain

* upgrade libs. Classifier is the new Brain for bayesian classification.
