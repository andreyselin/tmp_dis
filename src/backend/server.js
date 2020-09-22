const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const express = require ('express');
const path = require('path');
const bodyParser = require('body-parser');
const chime = new AWS.Chime({ region: 'us-east-1' });

// Set the AWS SDK Chime endpoint. The global endpoint is https://service.chime.aws.amazon.com.
chime.endpoint = new AWS.Endpoint(process.env.ENDPOINT || 'https://service.chime.aws.amazon.com');

const meetingTable = {};
const title = 'm1', region = 'eu-central-1', name = 'a1';
// Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);



    /////////////
    //         //
    //   API   //
    //         //
    /////////////





const app = express();
const port = 8080;
app.use(bodyParser.json());


app.use('/scripts', express.static(path.join(__dirname, '..', '..', 'dist/')));

app.get('/', (req, res, next) => {
  const thePath = path.join(__dirname, '..', '..', 'public/index.html');
  res.sendFile(thePath);
});

app.post('/join', async (req, res) => {
    if (!meetingTable[title]) {
        meetingTable[title] = await chime.createMeeting({
            ClientRequestToken: uuidv4(),
            MediaRegion: region,
            ExternalMeetingId: title.substring(0, 64),
        }).promise();
    }

    const meeting = meetingTable[title];

    const attendee = await chime.createAttendee({
        MeetingId: meeting.Meeting.MeetingId,
        ExternalUserId: `${uuidv4().substring(0, 8)}#${name}`.substring(0, 64),
    }).promise();

    res.json({
        JoinInfo: {
            Meeting: meeting,
            Attendee: attendee,
        }
    });
});

app.post('/end', async (req, res) => {
    await chime.deleteMeeting({
        MeetingId: meetingTable[title].Meeting.MeetingId,
    }).promise();
    res.json({});
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});
