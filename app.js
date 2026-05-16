const express = require('express');
const app = express();
const morgan = require('morgan');
const winston = require('winston');
const multer = require('multer');

//Winston
const logger = winston.createLogger({
    level: 'info', 
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json() 
    ),
    transports: [
        new winston.transports.File({ filename: 'app.log' })
    ]
});

//Morgan
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

app.get('/', (req, res) => {
    res.send('Server is running');
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Неправильний формат'), false);
    }
};

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: 1024 * 1024 },
    fileFilter: fileFilter 
});

app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.url} - ${duration}ms`);
    });
    next();
});

app.post('/upload', upload.single('file'), (req, res) => {
    logger.info('File upload endpoint triggered'); 
    res.send('File uploaded successfully');
});

app.post('/upload-multiple', upload.array('files', 5), (req, res) => {
    res.send('Деякі файли завантажено');
});

app.get('/status', (req, res) => {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    res.json({
        uptime,
        memoryUsage
    });
});

//Штучна помилка
app.get('/force-error', (req, res, next) => {
    const error = new Error('Щось пішло не так на сервері! Тестова помилка.');
    error.status = 300;
    next(error); // Передаємо помилку далі у мідлвар обробки
});

app.use((err, req, res, next) => {
    const statusCode = err.status || err.statusCode || 500;
    const errorMessage = err.message || 'Internal Server Error';

    logger.error({
        message: errorMessage,
        status: statusCode,
        method: req.method,
        url: req.originalUrl,
        stack: err.stack, 
        ip: req.ip
    });

    res.status(statusCode).json({
        success: false,
        error: {
            status: statusCode,
            message: errorMessage
        }
    });
});

app.listen(3000, () => {
    logger.info('Server started on port 3000');
    console.log('Server started on port 3000');
});