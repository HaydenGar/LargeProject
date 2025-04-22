const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://vellankianup:LMbRQXuFfhFCmnMh@journal-app.ncnkw8f.mongodb.net/Journal?retryWrites=true&w=majority&appName=journal-app';
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
            return res.status(400).json({UserId: -1, error: 'Username already in use.'});
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

app.post('/api/createEntry', upload.array('images', 5), async(req, res, next) => {
    const { userId, entryText} = req.body;

    //validation
    if(userId == null)
    {
        return res.status(400).json({ EntryId: -1, error: 'Invalid userId.' });
    }

    //try to create entry
    try
    {
        const db = client.db();

        //find entry with highest id
        const highestIdEntry = await db.collection('Entries')
            .find()
            .sort({ EntryId: -1})
            .limit(1)
            .toArray();

        //new entry's id #
        let newEntryId = 1;
        //entries exist
        if(highestIdEntry.length > 0)
        {
            newEntryId = highestIdEntry[0].EntryId + 1; //increment the id of current highest entryId
        }

        const dateCreated = new Date();

        //create new entry
        const newEntry =
        {
            EntryId: newEntryId,
            UserId: userId,
            DateCreated: dateCreated,
            EntryText: entryText
        }

        //insert into mongo
        await db.collection('Entries').insertOne(newEntry);
        return res.status(200).json({ EntryId: newEntryId, UserId: userId,
            DateCreated: dateCreated, EntryText: entryText, error: ''});
    }
    //failed to create entry
    catch(e)
    {
        return res.status(500).json({ EntryId: -1, error: 'Failed to create entry.'})
    }
});

app.post('/api/deleteEntry', async(req, res, next) => {
    const { entryId } = req.body;

    //ensure entryId exists
    if(entryId == null)
    {
        return res.status(400).json({ EntryId: -1, error: 'Missing EntryId.' });
    }

    //validate entryId is number
    const id = Number(entryId);
    if(Number.isNaN(id))
    {
        return res.status(400).json({ EntryId: -1, error: 'EntryId must be a number.' });
    }

    //try to delete
    try
    {
        const db = client.db();

        //delete entry
        const result = await db.collection('Entries').deleteOne({ EntryId:entryId });
        //error if nothing was deleted
        if(result.deletedCount === 0)
        {
            return res.status(404).json({ EntryId: entryId, error: 'Entry not found.' });
        }

        //success
        return res.status(200).json({ EntryId: entryId, error: ''});
    }
    //error during deletion
    catch(e)
    {
        return res.status(500).json({ EntryId: -1, error: 'Failed to delete entry.'})
    }
});

app.post('/api/updateEntry', async(req, res, next) => {
   const { entryId } = req.body;

    //ensure entryId exists
    if(entryId == null)
    {
        return res.status(400).json({ EntryId: -1, error: 'Missing EntryId.' });
    }

    try
    {

    }
    catch(e)
    {
        return res.status(500).json({ EntryId: -1, error: 'Failed to update entry.'})
    }
});

app.listen(5000); // start Node + Express server on port 5000
