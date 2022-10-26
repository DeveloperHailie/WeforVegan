const express = require('express');

const router = express.Router();

router.get('/',(req,res) => {
    res.send("Hello, This is test page.");
});

module.exports=router;