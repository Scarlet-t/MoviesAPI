/*********************************************************************************
* WEB422 – Assignment 1
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Jenny Zhang || Student ID: 142467232 || Date: 2025.Jan.16
* Vercel Link: _______________________________________________________________
*
********************************************************************************/
const HTTP_PORT = process.env.PORT || 1234;

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

//db setup
const MoviesDB = require("./modules/moviesDB.js");
const db = new MoviesDB;

db.initialize(process.env.MONGODB_CONN_STRING).then(() => {
    app.listen(HTTP_PORT, () => console.log(`server listening on ${HTTP_PORT}`));
}).catch((error) => {
    console.log(error);
});

app.get('/', (req, res) => {
    res.send({message: "API Listening"});
});

//This route uses the body of the request to add a new "Movie" document to the collection and return the
//newly created movie object / fail message to the client.
app.post('/api/movies', async (req, res) => {
    try {
        let movie = await db.addNewMovie(req.body);
        res.status(201).send(movie);
    }
    catch (error) {
        res.status(500).send(error);
    }
});

app.get('/api/movies', (req, res) => {
    const {page, perPage, title} = req.query;
    let vPage = parseInt(req.query.page);
    let vPerPage = parseInt(req.query.perPage)
    if (isNaN(vPage) || isNaN(vPerPage)) {
        res.status(500).send("one or more parameters invalid");
    }

    db.getAllMovies(vPage, vPerPage, title)
    .then((allMovies) => {
        console.log(allMovies);
        res.status(201).send(allMovies);
    })
    .catch((error) => res.status(500).send(error));

});

app.get('/api/movies/:id', (req, res) => {
    let id = req.params.id;
    db.getMovieById(id)
    .then((movie) => res.status(201).send(movie)).catch((error) => res.status(500).send(error));
});


app.put('/api/movies/:id', (req, res) => {
    let id = req.params.id;
    let body = req.body;
    db.updateMovieById(body, id)
    .then((result) => {
        console.log(result); //debug
        if (result.modifiedCount > 0)
            res.status(201).send(`Successfully updated movie.`);
        else
            res.status(500).send(`Failed to update.`);
    })
    .catch((error) => res.status(500).send(`ERROR: ${error}`));
});

app.delete('/api/movies/:id', (req,res) => {
    let id = req.params.id;
    db.deleteMovieById(id).then((result) => {
        console.log(result);
        res.status(201).send(`Successfully deleted movie.`);
    })
    .catch((error) => {
        res.status(500).send(`ERROR: ${error}`);
    });
});