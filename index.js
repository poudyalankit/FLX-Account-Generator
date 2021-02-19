var path = require('path')
const task = require(path.join(__dirname, '/task.js'));
const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("Enter number of accounts to generate: ", function(name) {
    for (var i = 0; i < parseInt(`${name}`); i++) {
        let accountGen = new task()
        accountGen.getInfo()
    }
    rl.close()
});