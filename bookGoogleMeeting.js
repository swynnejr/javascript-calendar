const {google} = require('googleapis');
const readline = require('readline');

// Authenticate and construct the calendar service
const calendar = google.calendar({
  version: 'v3',
  auth: YOUR_AUTH_CLIENT
});

// Define an array of available meeting times
const availableTimes = [
    new Date('2022-01-01T09:00:00.000Z'),
    new Date('2022-01-01T10:00:00.000Z'),
    new Date('2022-01-01T11:00:00.000Z'),
    new Date('2022-01-01T12:00:00.000Z')
];

// Print out the available times and ask the user to select one
availableTimes.forEach((time, index) => {
    console.log(`${index+1}. ${time.toISOString()}`);
});

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please select a meeting time by entering the corresponding number: ', (selectedTime) => {
    rl.question('Please enter any guests (comma separated email addresses): ', (guests) => {
        rl.question('Please enter a description for the event: ', (description) => {
            // Create the event
            const event = {
                summary: 'Meeting',
                description: description,
                start: {
                    dateTime: availableTimes[selectedTime-1].toISOString(),
                    timeZone: 'UTC',
                },
                end: {
                    dateTime: new Date(availableTimes[selectedTime-1].getTime() + 60 * 60 * 1000).toISOString(),
                    timeZone: 'UTC',
                },
                attendees: guests.split(',').map(guest => {
                    return {email: guest};
                }),
                organizer: {email: 'saucersam@gmail.com'}
            };

            // Send the calendar invite
            calendar.events.insert({
                calendarId: 'primary',
                resource: event
            }, (err, res) => {
                if (err) return console.log(`The API returned an error: ${err}`);
                console.log(`Event created: ${res.data.htmlLink}`);
                rl.close();
            });
        });
    });
});
