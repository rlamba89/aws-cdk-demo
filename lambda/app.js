const express = require('express');
const app = new express();


app.get('/', (req,res) =>{
    res.send('Hello World!');
});

const port = 8080
app.listen(port , () =>{
    console.log('Listening at 8080');
});

module.exports  = app;