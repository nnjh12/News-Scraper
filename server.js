var express = require("express");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://localhost/newsScraper", { useNewUrlParser: true });

// MangoLab
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI);

// handlebars
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");


////////////////////// Routes //////////////////////
/////////HOME/////////
// 0.A GET route for root
app.get("/", (req, res) => {
    db.Article.find({})
        .populate("note")
        .then(function (data) {
            let handlebarObject = {
                returnedArray: data
            }
            res.render("index", handlebarObject)
        })
})

// 1.A GET route for scraping the NPR website
app.get("/scrape", function (req, res) {
    console.log("SCRAPE")
    // drop the Article collection
    db.Article.deleteMany({}, err => {
        console.log("Deleted all documents in Article")
        console.log(err)
    });

    // First, we grab the body of the html with axios
    axios.get("https://www.npr.org/")
        .then(function (response) {
            console.log("NPR Axios Start")

            // Then, we load that into cheerio and save it to $ for a shorthand selector
            var $ = cheerio.load(response.data);

            // Now, we grab every h2 within an article tag, and do the following:
            $("div.story-text").each(function (i, element) {
                // Save an empty result object
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = $(this).children("a").children("h3").text();
                result.link = $(this).children("a").attr("href");

                console.log(result)

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                    .then(function (dbArticle) {
                        // View the added result in the console
                        console.log(dbArticle);
                        db.Article.find({})
                            .then(function (data) {
                                res.end()
                            })
                            .catch(err => { console.log(err) })
                    })
                    .catch(function (err) {
                        // If an error occurred, log it
                        console.log(err);
                    });
            });
        })
        .catch(err => { console.log(err) })
});

// 2.A GET route for favorites
app.get("/favorite", (req, res) => {
    db.Article.find({ favorite: true })
        .populate("note")
        .then(function (data) {
            let handlebarObject = {
                returnedArray: data
            }
            res.render("favorite", handlebarObject)
        })
})

// 3.A DELETE route for articles
app.delete("/article", (req, res) => {
    db.Article.deleteMany({})
        .then(function (data) {
            res.end()
        })
})

// 4.A PUT route for updating favorites
app.put("/favorite/:id", (req, res) => {
    let id = req.params.id
    console.log(req.body)
    db.Article.findByIdAndUpdate(id, { favorite: req.body.favorite }, (err, data) => {
        if (err) throw err
        console.log(data)
    }).then((data) => {
        console.log("dot then data" + data)
        res.end()
    })
})

// A GET route for note (add note button)
app.get("/note/:id", (req, res) => {
    let id = req.params.id

    db.Article.find({ _id: id })
        .then(function (data) {
            let handlebarObject = {
                returnedArray: data
            }
            res.render("note", handlebarObject)
        })
})

/////////FAVORITE PAGE/////////
//1. A PUT route for all favorites (clear all the favorite)
app.put("/favorite", (req, res) => {
    db.Article.updateMany({ favorite: true }, { favorite: false }, (err, data) => {
        if (err) throw err
        console.log(data)
    }).then(data => {
        console.log("dot then data" + data)
        res.end()
    })
})


/////////NOTE PAGE/////////
app.delete("/note/:id", (req, res) => {
    db.Note.deleteMany({ _id: req.params.id })
        .then(function (data) {
            res.end()
        })
})


app.post("/note/:id", (req, res) => {
    db.Note.create(req.body)
        .then(function (dbNote) {
            // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
            // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
            // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
})




// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // TODO: Finish the route so it grabs all of the articles
    db.Article.find({})
        .then(function (data) {
            res.json(data)
        })
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
    // TODO
    // ====
    // Finish the route so it finds one article using the req.params.id,
    // and run the populate method with "note",
    // then responds with the article with the note included
    db.Article.findOne({ _id: req.params.id })
        .populate("note")
        .then(function (data) {
            res.json(data)
        })
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
    // TODO
    // ====
    // save the new note that gets posted to the Notes collection
    // then find an article from the req.params.id
    // and update it's "note" property with the _id of the new note
    db.Note.create(req.body)
        .then(function (dataNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { note: dataNote._id } }, { new: true })
        })
        .then(function (dataArticle) {
            res.json(dataArticle)
        })
        .catch(function (err) {
            res.json(err)
        })


});

// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});
