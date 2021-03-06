module.exports = function(RED) {
  var AWS = require("aws-sdk");
  var AWSIot = require('aws-iot-device-sdk');
  
  function EventOutNode(config) {
    RED.nodes.createNode(this, config);
    var node = this; 
    this.account = RED.nodes.getNode(config.account);
    this.topic = config.topic;
    this.name = config.name;
    
    node.status({ fill:"red", shape:"ring", text:"disconnected" });
    
    this.account.on("login",function() {
      var creds = AWS.config.credentials;
      
      node.mqtt = AWSIot.device({
        region: AWS.config.region,
        protocol: 'wss',
        maximumReconnectTimeMs: 8000,
        accessKeyId: creds.accessKeyId,
        secretKey: creds.secretAccessKey,
        sessionToken: creds.sessionToken
      });

      node.mqtt.on('connect', function() {
        node.status({ fill:"green", shape:"dot", text:"connected" });
        node.on('input', function(msg) {
          node.mqtt.publish(msg.topic || node.topic, JSON.stringify(msg.payload));
        });
      });
      
      node.mqtt.on("error", function(err){
        node.error("MQTT error", err);
      })
    });
  }
  RED.nodes.registerType("cloud-connect-event-out", EventOutNode);
}