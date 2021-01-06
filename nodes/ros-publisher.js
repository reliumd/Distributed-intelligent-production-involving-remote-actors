module.exports = RED => {
  "use strict";
  const roslib = require("roslib");

  function publisherNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var advertised = false;

    node.connection = RED.nodes.getNode(config.connection);

    if (!node.connection || !node.connection.ros) {
      return;
    }

    node.topic = new roslib.Topic({
      ros: node.connection.ros,
      name: config.topic,
      messageType: config.messageType
    });

    node.on("close", () => {
      if (advertised && node.connection.ros.isConnected) {
        node.topic.unadvertise();
        node.log("Unadvertised topic");
      }
    });

    node.on("input", message => {
      if (!node.connection.ros.isConnected) {
        return;
      }
      // TODO: needs to be agnostic about message structure.
      node.topic.publish(new roslib.Message({data: message.payload}));
      advertised = true;
    });

    node.connection.ros.on("connection", () => {
      node.status({fill: "green", shape: "dot", text: "Connected"});
    });

    node.connection.ros.on("close", () => {
      node.status({fill: "red", shape: "dot", text: "Disconnected"});
    });
  }

  RED.nodes.registerType("ros-publisher", publisherNode);
}
