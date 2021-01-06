module.exports = RED => {
  "use strict";
  const roslib = require("roslib");

  function subscriberNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;

    node.connection = RED.nodes.getNode(config.connection);

    if (!node.connection || !node.connection.ros) {
        return;
    }

    node.on("close", () => {
      if (node.connection.ros.isConnected) {
        node.topic.unsubscribe();
        node.log("Unsubscribed to topic");
      }
    });

    node.connection.ros.on("connection", () => {
      node.status({fill: "green", shape: "dot", text: "Connected"});
    });

    node.connection.ros.on("close", () => {
      node.status({fill: "red", shape: "dot", text: "Disconnected"});
    });

    function subscribe() {
      node.connection.ros.getTopicType(config.topic, messageType => {
        if (!messageType) {
          setTimeout(() => {subscribe();}, 1000);
        } else {
          node.topic = new roslib.Topic({
            ros: node.connection.ros,
            name: config.topic,
            messageType: messageType,
            throttle_rate: parseInt(config.rate)
          });
          node.topic.subscribe(message => {
            node.send({payload: message});
          });
        }
      });
    }

    subscribe();
  }

  RED.nodes.registerType("ros-subscriber", subscriberNode);
}
