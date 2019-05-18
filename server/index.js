const keys = require('./keys');

// 1. Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

/**
 * Creating a new express app which accepts requests
 * and parse them into JSON + allow cross origin requests
 */ 
const app = express();
app.use(cors());
app.use(bodyParser.json());

// 2. Postgres Client Setup
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword,
    port: keys.pgPort
});
pgClient.on('error', () => console.log('Log PG Connection'));

// One time setup of table in PG, which stores a single column
pgClient
    .query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.log(err));

//3. Redis Client Setup
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});
// Need duplicate as listening/writing are separate
const redisPublisher = redisClient.duplicate();

//4. Express Route Handlers
app.get('/', (req, res) => {
    res.send('Hi');
});

// Return all values that have been submitted to postgress
app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});

// Return all indicies and their calculated values from redis
app.get('/values/current', async (req, res) => {
    //we have to use callbacks instead of async as the redis
    //client api doesn't support promises yet
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

//Submit index numbers to redis/postgres for calculation
app.post('/values', async (req, res) => {
    const index = req.body.index;

    if (parseInt(index) > 40){
        return res.status(422).send('Index too high');
    }

    redisClient.hset('values', index, 'Nothing yet!');
    //worker will listen to this publish event
    redisPublisher.publish('insert', index);

    //Submit the number to postgres
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);

    res.send({ working: true });
});

app.listen(5000, err => {
    console.log('Listening');
});