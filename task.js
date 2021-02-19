module.exports = class task {
    constructor() {
        require('log-timestamp');
        const fs = require('fs')
        const path = require('path')
        this.catchall = fs.readFileSync(path.join(__dirname, '/catchall.txt'), { encoding: 'utf8', flag: 'r' });
        const axios = require('axios').default;
        const axiosCookieJarSupport = require('axios-cookiejar-support').default;
        const tough = require('tough-cookie');
        axiosCookieJarSupport(axios);
        this.cookieJar = new tough.CookieJar();
        this.csrftoken;
        this.firstName;
        this.lastName;
        this.email;
        this.phoneNumber = makeNumbers(10);
        this.postalCode = makeNumbers(5);
        this.birthday = makeBirthday();
        this.password = makePassword(16);
    }

    async getInfo() {
        const axios = require('axios').default;
        console.log("Generating info")
        axios({
            method: 'get',
            url: 'https://randomuser.me/api/',
        }).then(response => {
            console.log("Generated info")
            this.firstName = response.data.results[0].name.first
            this.lastName = response.data.results[0].name.last
            this.email = this.firstName + this.lastName + this.catchall;
            this.getSession()
        }).catch(error => {
            console.log("Error getting csrfToken")
            sleep(5000).then(() => {
                this.getInfo()
            });
        })
    }

    async getSession() {
        const axios = require('axios').default;
        console.log("Getting session")
        axios({
            method: 'get',
            url: ' https://www.footlocker.com/api/v3/session?timestamp=' + getTimestamp(),
            jar: this.cookieJar,
            withCredentials: true,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
            }
        }).then(response => {
            console.log("Got session")
            this.csrfToken = response.data.data.csrfToken;
            this.createAccount()
        }).catch(error => {
            console.log("Error getting csrfToken")
            sleep(5000).then(() => {
                this.getSession()
            });
        })
    }

    async createAccount() {
        const axios = require('axios').default;
        const { v4: uuidv4 } = require('uuid');
        const fs = require('fs')
        const path = require('path')
        console.log("Creating account")
        axios({
            method: 'post',
            url: 'https://www.footlocker.com/api/v3/users/?timestamp=' + getTimestamp(),
            jar: this.cookieJar,
            withCredentials: true,
            headers: {
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36',
                'x-csrf-token': this.csrfToken,
                'x-fl-request-id': uuidv4()
            },
            data: {
                "bannerEmailOptIn": false,
                "birthday": this.birthday,
                "firstName": this.firstName,
                "flxTcVersion": "2.0",
                "lastName": this.lastName,
                "loyaltyFlxEmailOptIn": false,
                "loyaltyStatus": true,
                "password": this.password,
                "phoneNumber": this.phoneNumber,
                "postalCode": this.postalCode,
                "uid": this.email,
                "wantToBeVip": false
            }
        }).then(response => {
            if (response.statusText === "Created") {
                console.log("Account Created")
                fs.appendFileSync(path.join(__dirname, '/accounts.txt'), this.email + ":" + this.password + "\n");
            }
        }).catch(error => {
            console.log(error.response.data)
        })
    }
}


const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

Array.prototype.sample = function() {
    return this[Math.floor(Math.random() * this.length)];
}

function makePassword(length) {
    const password = require('secure-random-password');

    return password.randomPassword({
        characters: [
            password.upper,
            password.symbols,
            password.lower,
            password.digits
        ]
    });

}

function makeNumbers(length) {
    let result = '';
    let characters = '1234567890';
    let charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function makeBirthday(length) {
    let months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    let days = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28"]
    let years = ["1995", "1996", "1997", "1998", "1999", "2000"]

    return months.sample() + "/" + days.sample() + "/" + years.sample();
}

function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}