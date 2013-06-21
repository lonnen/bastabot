var fs = require("fs"),
    brain = require("brain"),
    nomnom = require("nomnom");

var parser = nomnom.globalOpts({
    filename: {
        string: "-f FILE, --file=FILE",
        default: 'itsfine.json',
        help: 'File to read from or write to'
    },
    redisHost: {
        string: "--redis-host=HOST",
        default: "localhost",
        help: "Redis host to use. (Default: localhost)"
    },
    redisPort: {
        string: "--redis-port=PORT",
        default: 6379,
        help: "Redis port to use. (Default: 6379)"
    }
  });
parser.command("load").callback(load);
parser.command("dump").callback(dump);

parser.parseArgs();


function load(options) {
    fs.readFile(options.filename, function(err, contents) {
        if(err) throw err;
        var json = JSON.parse(contents);
        createBayes(options).fromJSON(json);
    });
}

function dump(options) {
    createBayes(options).toJSON(function(json) {
        fs.writeFile(options.filename, JSON.stringify(json), function(err) {
            if(err) throw err;
        });
    });
}

function createBayes(options) {
  return new brain.BayesianClassifier({
      backend: {
          type: "memory",
          options: {
              name: "bastabot"
          }
      }
  });
};

