const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb+srv://vellankianup:LMbRQXuFfhFCmnMh@journal-app.ncnkw8f.mongodb.net/Journal?retryWrites=true&w=majority&appName=journal-app';
const client = new MongoClient(url);
client.connect();

const upload = multer({ storage: multer.memoryStorage() });

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

app.post('/api/createEntry', upload.array('images', 3), async(req, res, next) => {
    const { userId, entryText } = req.body;
    const parsedUserId = parseInt(userId, 10);

    //validation
    if(Number.isNaN(parsedUserId))
    {
        return res.status(400).json({ EntryId: -1, error: 'Invalid userId.' });
    }

    //try to create entry
    try
    {
        const db = client.db();
        const bucket = new GridFSBucket(db, { bucketName: 'entryImages'});

        const imageFileIds = [];
        for(const file of req.files)
        {
            const uploadStream = bucket.openUploadStream(file.originalname,
                { contentType: file.mimetype }
            );
            uploadStream.end(file.buffer);

            await new Promise((resolve, reject) => {
                uploadStream.on('error', reject);
                uploadStream.on('finish', () => resolve());
            });
            imageFileIds.push(uploadStream.id);
        }

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
            UserId: parsedUserId,
            DateCreated: dateCreated,
            EntryText: entryText,
            ImageFileIds: imageFileIds
        }

        //insert into mongo
        await db.collection('Entries').insertOne(newEntry);
        return res.status(200).json({ EntryId: newEntryId, UserId: parsedUserId,
            DateCreated: dateCreated, EntryText: entryText, ImageFileIds: imageFileIds, error: ''});
    }
    //failed to create entry
    catch(e)
    {
        console.error('boom: ', e);
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
        const bucket = new GridFSBucket(db, { bucketName: 'entryImages' });

        //find entry
        const result = await db.collection('Entries').findOne({ EntryId:id });
        //entry not found
        if(!result)
        {
            return res.status(404).json({ EntryId: id, error: 'Entry not found.' });
        }

        //delete GridFS image file by ObjectId
        if(Array.isArray(result.ImageFileIds))
        {
            await Promise.all(
                result.ImageFileIds.map(fileId => bucket.delete(new ObjectId(fileId)))
            );
        }

        //delete entry itself
        await db.collection('Entries').deleteOne({ EntryId: id})

        //success
        return res.status(200).json({ EntryId: id, error: ''});
    }
    //error during deletion
    catch(e)
    {
        return res.status(500).json({ EntryId: -1, error: 'Failed to delete entry.'})
    }
});

app.post('/api/updateEntry', async (req, res, next) => {
    const { entryId, entryText } = req.body;

    // ensure entryId exists
    if (entryId == null) {
        return res.status(400).json({ EntryId: -1, error: 'Missing EntryId.' });
    }
    // validate entryId is a number
    const id = Number(entryId);
    if (Number.isNaN(id)) {
        return res.status(400).json({ EntryId: -1, error: 'EntryId must be a number.' });
    }

    try {
        const db = client.db();
        const result = await db
            .collection('Entries')
            .updateOne(
                { EntryId: id },
                { $set: { EntryText: entryText } }
            );

        // no match means the entry wasn’t found
        if (result.matchedCount === 0) {
            return res.status(404).json({ EntryId: id, error: 'Entry not found.' });
        }

        // success
        return res.status(200).json({
            EntryId: id,
            EntryText: entryText,
            error: ''
        });
    } catch (e) {
        return res.status(500).json({ EntryId: -1, error: 'Failed to update entry.' });
    }
});

app.get('/api/entryImage/:fileId', async(req, res, next) => {
    await client.connect();
    const db = client.db();
    const bucket = new GridFSBucket(db, { bucketName: 'entryImages'});

    let fileId;
    try
    {
            fileId = new ObjectId(req.params.fileId);
    }
    catch
    {
            return res.status(400).json({ error: 'Invalid file ID.'});
    }

    const filesCollection = client.db().collection('entryImages.files');
    const fileDocument = await filesCollection.findOne({ _id: fileId });
    if(!fileDocument)
    {
            return res.status(404).json({ error: 'Image not found.' });
    }

    //set header
    res.set('Content-Type', fileDocument.contentType || 'application/octet-stream');

    //stream file chunks to client
    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', () => res.sendStatus(404));
    downloadStream.pipe(res);
});

app.listen(5000); // start Node + Express server on port 5000
