const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = '';
const client = new MongoClient(url);
client.connect();

app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, DELETE, OPTIONS'
    );
    next();
});

app.post('/api/login', async (req, res, next) => {
    // incoming: login, password
    // outgoing: id, firstName, lastName, error

    var error = '';

    const { login, password } = req.body;

    const db = client.db();
    const results = await db.collection('Users').find({ Login: login, Password: password }).toArray();


    var id = -1;
    var fn = '';
    var ln = '';

    if (results.length > 0) {
        id = results[0].UserId;
        fn = results[0].FirstName;
        ln = results[0].LastName;
    }

    var ret = { id: id, firstName: fn, lastName: ln, error: '' };
    res.status(200).json(ret);
});

app.post('/api/register', async(req, res, next) => {
    const { firstName, lastName, username, password } = req.body;

    //validate there is input for all request arguements
    if(!firstName || firstName.trim() === '' ||
        !lastName || lastName.trim() === '' ||
        !username || username.trim() === '' ||
        !password || password.trim() === '')
    {
        return res.status(400).json({ UserId: -1, error:'Please ensure all fields have been filled.'});
    }

    try
    {
        const db = client.db();

        //check if username already in use
        const existingUser = await db.collection('Users').findOne({ Login: username },
            { collation: { locale: 'en', strength: 2 }}); //case-insensitive search (collation achieves this)
        if(existingUser) //existing username found
        {
            return res.status(400).json({UserId: -1, error: 'Username already in use.'}) //error nums?
        }

        //generate UserId
        const highestIdUser = await db.collection('Users')
            .find() //finds every document in collection
            .sort({ UserId: -1 }) //sorts documents in descending order (-1) based on UserId
            .limit(1) //only provide the first document AKA the highest (1)
            .toArray();

        //new user's ID #
        let newUserId = 1;
        //if users exist
        if(highestIdUser.length > 0)
        {
            newUserId = highestIdUser[0].UserId + 1; //increment the ID of current highest UserId for the new user
        }

        //create new user
        const newUser =
        {
            UserId: newUserId,
            FirstName: firstName,
            LastName: lastName,
            Login: username,
            Password: password
        }

        //insert new user into mongo
        await db.collection('Users').insertOne(newUser);
        return res.status(200).json({ UserId:newUserId, FirstName: firstName,
            LastName: lastName, Login: username, error: '' });
    }
    catch(e)
    {
        return res.status(500).json({ UserId: -1, error: 'Failed to register.'});
    }
});

app.listen(5000); // start Node + Express server on port 5000