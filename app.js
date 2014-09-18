var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var segment=require('./webAPI/segment.js');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({limit:'50mb'}));
app.use(bodyParser.json({ type: 'application/vnd.api+json',limit:'50mb' }));

app.use(express.static(__dirname + '/public'));

//segment
app.post("/maintain/newsSegment",segment.newsSegment);
app.post("/maintain/gradeSplit",segment.gradeSplit);
app.get("/maintain/loadGradeWords",segment.loadGradeWords);
app.post("/maintain/updateGradeWords",segment.updateGradeWords);

app.listen(1337, function () {
    console.log('Express server listening on port 1337');
});

