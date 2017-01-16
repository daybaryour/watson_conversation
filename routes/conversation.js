var express = require('express');
var router = express.Router();

var ConversationV1 = require('watson-developer-cloud/conversation/v1');

// Set up Conversation service wrapper.
var conversation = new ConversationV1({
    username: '5bb9874b-6bbd-4cdf-8dce-3af65fc7c3ef', // replace with username from service key
    password: 'CTl81gp6BrVw', // replace with password from service key
    path: { workspace_id: 'bc9e5d1e-bbf9-4ae1-9b02-402da6d7dd0f' }, // replace with workspace ID
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