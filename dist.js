var Promise = require("bluebird");
var fs = require("fs");
var delAsync = Promise.promisify(require("del"));
var exec = Promise.promisify(require('child_process').exec);
var ncp = Promise.promisify(require('ncp').ncp);

var local = 'tmp';
var repo = 'https://github.com/private-vault/vault';

var branch = process.argv[2] || 'master';

var synchRepoAction = (function cloneOrPull() {
    var cloned = fs.existsSync(local);

    if (cloned) {
        console.log('Pulling latest changes from main repo...');
        action = 'git checkout ' + branch + '&& cd ' + local + ' && git checkout ' + branch + ' && git pull';
    } else {
        console.log('Cloning main repo...');
        action = 'git checkout ' + branch + '&& git clone -b ' + branch + '  ' + repo + ' ' + local;
    }

    return action;
}())

exec(synchRepoAction)
    .then(function() {
        console.log('Compiling project...');
        return exec('cd ' + local + ' && npm install && bower install && gulp');
    })
    .then(function() {
        console.log('Removing previously compiled release files...');
        return delAsync('dist/*');
    })
    .then(function() {
        console.log('Copying compiled files to release...');

        var distPath = local + '/api/public';

        return ncp(distPath, 'dist');
    })
    .then(function() {
        console.log('Removing index.php file...');

        var distPath = local + '/api/public';

        return delAsync('dist/index.php');
    })
    .then(function() {
        console.log('Finding last commit ID...');

        return exec('cd ' + local + ' && git rev-parse HEAD');
    })
    .then(function(lastCommitId) {
        lastCommitId = lastCommitId[0].trim();

        console.log('Commiting changes as ' + lastCommitId + '...');

        return exec('git add -A && git commit -am "' + lastCommitId + '"');
    })
    .then(function() {
        console.log('Pushing changes to master...');

        return exec('git push origin ' + branch);
    })
    .done();
