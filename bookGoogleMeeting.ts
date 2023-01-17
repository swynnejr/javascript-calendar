
import { GoogleApis } from 'googleapis';
import readline from 'readline';

const calendar = new GoogleApis.calendar('v3');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Prompt user for date in YYYY-MM-DD format
rl.question('Enter a date in YYYY-MM-DD format: ', (date: string) => {
    // Use Google Calendar API to get events for that day
    calendar.events.list({
        calendarId: 'primary',
        timeMin: `${date}T00:00:00.000Z`,
        timeMax: `${date}T23:59:59.999Z`,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err: any, res: any) => {
        if (err) return console.log(err);

        // Get the start and end times of the events
        const available_times: any[] = res.data.items.map((event: any) => {
            return {
                start: event.start.dateTime,
                end: event.end.dateTime
            };
        });

        // Print out available times
        console.log('Available times:');
        available_times.forEach((time: any, index: number) => {
            console.log(`${index + 1}. ${time.start} - ${time.end}`);
        });

        // Ask user to select a time
        rl.question('Select a time: ', (selectedTime: any) => {
            const time = available_times[selectedTime - 1];
            // Ask user to add guests and description
            rl.question('Add guests (comma separated): ', (guests: string) => {
                rl.question('Add description: ', (description: string) => {
                    // Create event with start and end time, guests, and description
                    calendar.events.insert({
                        calendarId: 'primary',
                        resource: {
                            start: {
                                dateTime: time.start,
                                timeZone: 'UTC',
                            },
                            end: {
                                dateTime: time.end,
                                timeZone: 'UTC',
                            },
                            attendees: guests.split(',').map((email: string) => {
                                return { email };
                            }),
                            description,
                        },
                    }, (err: any, event: any) => {
                        if (err) return console.log(err);
                        console.log(`Event created: ${event.data.htmlLink}`);
                        rl.close();
                    });
                });
            });
        });
    });
});