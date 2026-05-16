const express = require('express');
const app = express();

//Morgan
const morgan = require('morgan');
app.use(morgan('combined'));

//Winston
const winston = require('winston');
const logger = winston.createLogger({
    level: 'info',
    transports: [
        new winston.transports.File({ filename: 'app.log' })
    ]
});
logger.info('Server started');

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
    res.send('File uploaded successfully');
});

app.get('/status', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    res.json({
        uptime,
        memoryUsage
    });
});

