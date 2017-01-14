var express = require('express');
var router = express.Router();

var ConversationV1 = require('watson-developer-cloud/conversation/v1');

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
    username: '2ff540d4-6c99-473f-b857-448c1577ada8', // replace with username from service key
    password: 'ijrujLgC3xk1', // replace with password from service key
    path: { workspace_id: '172a2a48-5457-4408-b384-56cbea19f7b9' }, // replace with workspace ID
    version_date: '2016-07-11'
});

//This would handle calls to the conversation api
router.get('/conversation', function(req, res, next) {
    conversation.message({}, function processResponse(err, response) {
        if (err) {
            res.send(err);
        } else {
            res.json(response);
        } 
    });
})

router.post('/postConversation', function(req, res, next) {
    var message = req.body.message;
    var context = req.body.context;

    conversation.message({ input: { text: message }, context : context},  function processResponse(err, response) {
        if (err) {
            res.send(err);
        } else {
            res.json(response);
        } 
    });
})


module.exports = router;