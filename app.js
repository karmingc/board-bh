const express = require('express');
const app = express();


const port = 4000;
app.use('/', (req, res) => {
    res.send('yo')
});

app.listen(port, () => {
    console.log(`current listening to port ${port}`)
})