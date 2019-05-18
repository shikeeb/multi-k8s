const keys = require('./keys');
const redis = require('redis');

const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    //if it loses connection to redis, retry every second
    retry_strategy: () => 1000
});

/**
 * We'll use this to watch redis and get 
 * a new value everytime it shows up
 */
const sub = redisClient.duplicate();

function fib(index) {
    if (index < 2) {
        return 1;
    }
    return fib(index - 1) + fib(index - 2);
}

/**
 * Everytime we get a new value that shows up in redis, 
 * we're going to calculate a new Fibonacci value and then
 * insert it into the hashset of values that we call 'values'
 * The key will be the index we passed in
 */
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});

/**
 * Subscribe to any insert event
 */
sub.subscribe('insert');