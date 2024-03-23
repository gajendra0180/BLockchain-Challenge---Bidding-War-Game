const express = require('express');
const apiRouter = require('./routes/router');
const eventHandler = require("./events/eventHandler");
const logger = require('./utils/logger');
const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(express.json());

app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.log(`Server running on port ${PORT}`);
});
