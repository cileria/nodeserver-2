const express = require('express');
const randomstring = require('randomstring');
const fs = require('fs');
const cors = require('cors');

const app = express();

// default options
app.use(cors());
app.use('/', express.static(__dirname + '/public'));
app.use(express.json());

app.post('/comments', (req, res) => {
    if (!req.body.name || !req.body.text)
        return res.status(400).send({error: 'name and text required'});

    fs.readFile(__dirname + '/comments.json', (err, data) => {

        if(err) return res.send({ error: err });
        
        let comments = null;
        try { comments = JSON.parse(data); }
        catch(e) {
            return res.send({ error: e.toString() });
        }

        if(!Array.isArray(comments)) {
            return res.send({error: 'comments json is invalid'});
        }

        let newComment = req.body;
        newComment.id = randomstring.generate(20);
        comments.push(newComment);

        let strComments = null;
        try {
            strComments = JSON.stringify(comments);
        }
        catch(e) {
            return res.send({ error: e });
        }

        fs.writeFile(__dirname + '/comments.json', strComments, function(err) {
            if(err) return res.send({ error: err });

            return res.send({ error: 0, comment: newComment });
        })
    });
});

app.delete('/comments/:commentid', function(req, res) {
    if(!req.params.commentid) {
        return res.send({ error: 'commentid required' });
    }

    fs.readFile(__dirname + '/comments.json', function(err, data) {
        var comments = null;
        try { comments = JSON.parse(data); }
        catch(e) {
            return res.send({ error: e });
        }

        let comment = null;
        for(let i=0; i<comments.length; i++) {
            if(comments[i].id === req.params.commentid) {
                comment = comments[i];
                comments.splice(i, 1);
                break;
            }
        }

        if(!comment) return res.send({ error: 'comment not found' });
        let strComments = JSON.stringify(comments);
        fs.writeFile(__dirname + '/comments.json', strComments, function(err) {
            if(err) {
                return res.send({ error: err});
            }
            
            return res.send({ error: 0 });
        });
    });
});

app.get('/comments', function(req, res) {
    fs.readFile(__dirname + '/comments.json', function(err, data) {
        if(err) return res.send({ error: err });

        let comments = null;
        try {
            comments = JSON.parse(data);
        }
        catch(err) {
            return res.send({ error: err.toString() });
        }

        if(req.query.category) {
            let category = req.query.category;
            let resultcomments = [];
            
            for(let i=0; i<comments.length; i++) {
                if(comments[i].category === category) {
                    resultcomments.push( comments[i] );
                }
            }
            return res.send({ error: 0, comments: resultcomments });
        }
        else {
            return res.send({ error: 0, comments: comments });
        }
    });
});

console.log('started comments server.');
app.listen( 3001 );