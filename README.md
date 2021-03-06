# Hermes tracking API + Website for IT-Talents contest

## Tracking id creation algorithm

`'HMS' + hexint(crc32(date + senderPostCode + receiverPostCode)) + hexint(crc32(packageSize + isExpress))`

'HMS' stands for 'Hermes' :)

I use crc32 because it returns a short hash which is user friedly.
It isn't save like a common hash algorithm but in this use case it doesn't have to be very save. (Who wants to brutefore a tracking id? xD)

The length of the tracking id is variable because the hash does not return always a hash with the same length.
I use a hash algorithm to generate the tracking id because hash algorithms are specially designed to create a unique id of a text or something.

## Used Languages + Libraries
* JavaScript ES5 (for Frontend)
* JavaScript ES6 / ES8 - NodeJS (for Backend)
* aja.js as HTTP library (for Frontend)
* express.js as backend library
* sequelize as database orm (for Backend)
* jsonwebtoken (for Authentication / Backend)

## Features
* Mobile optimized
* Software tests
* Frontend for users and staff
* Nice UI
* REST API
* Single Page Application
* SQLite Database
* Good documentation
* Save track id generation
* Authentication (with tokens)

## How to setup

### Preinstall
Make sure you have NodeJS, Python (for node-sqlite compilation) and Git installed. (Python in path variable)

### Downloading
```
git clone https://github.com/danieldaeschle/it-talents-hermes-tracking.git
cd it-talents-hermes-tracking
```

### Docker (Optional)
Run the following commands (make sure you have internet access):
```
docker build . -t it-talents-tracking
docker run -d -p 80:80 it-talents-tracking
```

### Manual
Run the following commands (make sure you have internet access):
```
cd path/to/app/dir
npm install --production
npm start
```

### Result
Now you can route to [http://127.0.0.1/](http://127.0.0.1/) in your browser.


## API

### POST `/api/authenticate`
Returns a token which gives you access to all staff resources.<br>
Username: talent<br>
Password: iamnotsecret

Expiration time of a token is 1 hour.

**Exmaple payload**
```JSON
{
    "password": "iamnotsecret",
    "username": "talent"
}
```

**Example result**
```JSON
{
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRhbGVudCIsInBhc3N3b3JkIjoiaWFtbm90c2VjcmV0IiwiaWF0IjoxNTE5Mzc1NzU3LCJleHAiOjE1MTkzNzkzNTd9.sRdl-7IO_Q1wHeFK9zs0P-K0ftza8JAfs6bSgBongSo"
}
```

**You can add the token in a requests header as 'X-Access-Token'.**


### GET `/api/tracks/:trackingId`
Returns the track object by id.

**Example result**
```JSON
{
    "trackingNumber": "HMS30664162862467031686",
    "senderPostCode": "79588",
    "receiverPostCode": "79588",
    "date": "2018-02-16T08:27:21.46Z",
    "packageSize": 1,
    "isExpress": false,
    "packageStates": [
        {
            "progress": 2,
            "locationPostCode": "79588",
            "message": null,
            "timestamp": "2018-02-16T12:40:15.650Z"
        },
        {
            "progress": 1,
            "locationPostCode": "79588",
            "message": null,
            "timestamp": "2018-02-16T12:40:42.471Z"
        }
    ]
}
```

### POST `/api/tracks/:trackingId`
Creates a state for the package progress.

**Example payload**
```JSON
{
    "progress": 1,
    "locationPostCode": "79576",
    "message": "some text"
}
```
`message` is not required.

**Example result**
```JSON
{
    "data": {
        "locationPostCode": "79576",
        "message": "some text",
        "progress": 1,
        "timestamp": "2018-02-16T12:40:15.650Z"
    },
    "error": false
}
```

### POST `/api/tracks/:trackingId`
Deletes a single track. This is only for staff (not users).

**Example result**
```JSON
{
    "message": "Track has been deleted",
    "error": false
}
```

### GET `/api/tracks`
Returns all tracks. This is only for staff (not users).

**Example result**
```JSON
{
    "data": [
        {
            "trackingNumber": "HMS30664162862467031686",
            "senderPostCode": "79588",
            "receiverPostCode": "79588",
            "date": "2018-02-16T08:27:21.46Z",
            "packageSize": 1,
            "isExpress": false,
            "packageStates": [
                {
                    "progress": 2,
                    "locationPostCode": "79588",
                    "message": null,
                    "timestamp": "2018-02-16T12:40:15.650Z"
                },
                {
                    "progress": 1,
                    "locationPostCode": "79588",
                    "message": null,
                    "timestamp": "2018-02-16T12:40:42.471Z"
                }
            ]
        },
        {
            "trackingNumber": "HMS30664162862467031686",
            "senderPostCode": "79576",
            "receiverPostCode": "793248",
            "date": "2018-03-16T08:27:21.46Z",
            "packageSize": 2,
            "isExpress": true,
            "packageStates": [
                {
                    "progress": 1,
                    "locationPostCode": "79588",
                    "message": null,
                    "timestamp": "2018-02-16T12:40:15.650Z"
                }
            ]
        }
    ],
    "error": false
}
```

### POST `/api/tracks`
Creates a track. This is only for staff (not for users).

**Expected payload**
```JSON
{
	"senderPostCode": "79588",
	"receiverPostCode": "79588",
	"date": "2018-02-16T08:27:21.46Z",
	"packageSize": 1
}
```

**Example result**
```JSON
{
    "data": {
        "trackingNumber": "HMS30664162862467031686",
        "senderPostCode": "79588",
        "receiverPostCode": "79588",
        "date": "2018-02-16T08:27:21.46Z",
        "packageSize": 2,
        "isExpress": false,
        "packageStates": []
    },
    "error": false
}
```
