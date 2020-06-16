const BumblebeeAPI = require('../../../api');
const EdisonAssistant = require('./EdisonAssistant');

BumblebeeAPI.connectAssistant('hey_edison', EdisonAssistant);