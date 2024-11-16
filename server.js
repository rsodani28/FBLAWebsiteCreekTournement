const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3002;

app.use(bodyParser.json());
app.use(cors());

// Serve static files from the current directory
app.use(express.static(__dirname));

app.post('/save-event', (req, res) => {
    const event = req.body;
    const eventData = `Title: ${event.title}, Start: ${event.start}, End: ${event.end}, URL: ${event.url}, Image: ${event.image}, AllDay: ${event.allDay}\n`;

    fs.appendFile('events.txt', eventData, (err) => {
        if (err) {
            console.error('Error writing to file', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.status(200).send('Event saved successfully');
        }
    });
});

app.get('/get-events', (req, res) => {
    fs.readFile('events.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file', err);
            res.status(500).send('Internal Server Error');
        } else {
            const events = data.trim().split('\n').map(line => {
                const [title, start, end, url, image, allDay] = line.split(', ').map(item => item.split(': ')[1]);
                return { title, start, end, url, image, allDay: allDay === 'true' };
            });
            res.json(events);
        }
    });
});

app.post('/update-counter', (req, res) => {
    const event = req.body.event;
    const numPeople = parseInt(req.body.numPeople, 10);

    const counterFile = 'counter.txt';
    let counters = {};

    // Read existing counters
    if (fs.existsSync(counterFile)) {
        const lines = fs.readFileSync(counterFile, 'utf-8').split('\n').filter(Boolean);
        lines.forEach(line => {
            const [eventTitle, count] = line.split(': ');
            counters[eventTitle] = parseInt(count, 10);
        });
    }

    // Update the counter for the selected event
    if (counters[event]) {
        counters[event] += numPeople;
    } else {
        counters[event] = numPeople;
    }

    // Write the updated counters back to the file
    const data = Object.entries(counters).map(([eventTitle, count]) => `${eventTitle}: ${count}`).join('\n');
    fs.writeFileSync(counterFile, data);

    res.send('Counter updated successfully!');
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
