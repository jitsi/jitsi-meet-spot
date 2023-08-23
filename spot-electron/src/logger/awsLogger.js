const {
    CloudWatchLogsClient,
    DescribeLogStreamsCommand,
    PutLogEventsCommand,
    CreateLogStreamCommand
} = require('@aws-sdk/client-cloudwatch-logs');
const {
    FirehoseClient,
    PutRecordCommand
} = require('@aws-sdk/client-firehose');

const { getHostId, parseLogMessage } = require('./utils');

const region = process.env.REGION;
const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
};
const deliveryStreamName = process.env.FIREHOSE_DELIVERY_STREAM;
const logGroupName = process.env.CLOUDWATCH_LOG_GROUP;
const logStreamName = getHostId();

const firehoseClient = new FirehoseClient({
    credentials,
    region
});

const cloudwatchClient = new CloudWatchLogsClient({
    credentials,
    region
});

/**
 * Creates a Cloudwatch log stream.
 */
const createLogStream = async () => {
    const command = new CreateLogStreamCommand({
        logGroupName,
        logStreamName
    });

    try {
        await cloudwatchClient.send(command);
        console.log(`Successfully created log stream ${logStreamName}.`);
    } catch (error) {
        console.error('Error - couldn\'t create log stream:', error, error.stack);
    }
};

/**
 * Adds logs to a Cloudwatch log stream.
 */
const putLogEvents = async message => {
    const command = new PutLogEventsCommand({
        logEvents: [ {
            message,
            timestamp: Date.now()
        } ],
        logGroupName,
        logStreamName
    });

    try {
        await cloudwatchClient.send(command);
    } catch (error) {
        console.error('Error - couldn\'t save log events:', error, error.stack);
    }
};

/**
 * Creates a Cloudwatch log stream if it doesn't exist.
 */
const maybeCreateLogStream = async () => {
    const command = new DescribeLogStreamsCommand({
        logGroupName,
        logStreamNamePrefix: logStreamName
    });

    try {
        const response = await cloudwatchClient.send(command);

        // This call can return an empty response without throwing an exception.
        // Additionally, the results may not match 100%,
        // So we need to make sure the log stream gets created.
        const isLogStreamPresent = response.logStreams.find(stream => stream.logStreamName === logStreamName);

        if (!response.logStreams.length || !isLogStreamPresent) {
            createLogStream();
        }
    } catch (error) {
        if (error.__type === 'ResourceNotFoundException') {
            console.error('Error - log stream does not exist', error, error.stack);

            createLogStream();
        } else {
            console.error('Error - couldn\'t describe log streams:', error, error.stack);
        }
    }
};

/**
 * Logs a message to Cloudwatch.
 *
 * @param {string} level - The log level index.
 * @param {string} message - The main string to be logged.
 * @returns {void}
 */
const logToCloudwatch = async (level, message) => {
    putLogEvents(parseLogMessage(level, message));
};

/**
 * Logs a message to S3 via Firehose.
 *
 * @param {string} level - The log level index.
 * @param {string} message - The main string to be logged.
 * @returns {void}
 */
const logToS3 = async (level, message) => {
    const command = new PutRecordCommand({
        DeliveryStreamName: deliveryStreamName,
        Record: {
            Data: Buffer.from(`
${logStreamName} | ${new Date().toISOString()} | ${parseLogMessage(level, message)}`)
        }
    });

    try {
        await firehoseClient.send(command);
    } catch (error) {
        console.error('Error - couldn\'t put record:', error, error.stack);
    }
};

module.exports = {
    maybeCreateLogStream,
    logToS3,
    logToCloudwatch
};
