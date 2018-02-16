# Hermes tracking API + Website for IT-Talents contest

## Tracking id creation algorithm

`'HMS' + hexint(crc32(trackId + date + senderPostCode + receiverPostCode + packageSiz + isExpress))`

'HMS' stands for 'Hermes' :)

I use crc32 because it returns a short hash which is user friedly.
It isn't save like a common hash algorithm but in this use case it can be ignored. (Who wants to brutefore a tracking id? xD)

## API

### GET `/api/tracks/:trackingId`
Returns the track object by id.

Example result:
```JSON
{
    "trackingNumber": "HMS1520801121",
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
        "progress": 1
    },
    "error": false
}
```

### GET `/api/tracks`
Returns all tracks. This is only for staff (not users).

**Example result**
```JSON
[
    {
        "trackingNumber": "HMS1520801121",
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
        "trackingNumber": "HMS1520801123",
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
]
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
        "trackingNumber": "HMS3694258127",
        "senderPostCode": "79588",
        "receiverPostCode": "79588",
        "date": "2018-02-16T08:27:21.46Z",
        "packageSize": 2,
        "isExpress": false
    },
    "error": false
}
```
