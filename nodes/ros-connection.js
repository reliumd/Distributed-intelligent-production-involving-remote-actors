module.exports = RED => {
  "use strict";
  const roslib = require("roslib");

  function connectionNode(config) {
    RED.nodes.createNode(this, config);
    var node = this;
    var closing = false;
    var reconnecting = false;
    node.ros = new roslib.Ros();

    node.on("close", () => {
      closing = true;
      if (node.timer) {
        clearTimeout(node.timer);
        reconnecting = false;
      }
      node.ros.close();
    });

    node.ros.on("error", error => {
      node.log(error);
    });

    node.ros.on("connection", () => {
      node.log("Connected");
    });

    node.ros.on("close", () => {
      if (!closing && !reconnecting) {
        node.timer = setTimeout(() => {connect();}, 1000);
        reconnecting = true;
        node.log("Attempting to reconnect");
      } else if (closing) {
        node.log("Disconnected");
      }
    });

    function connect() {
      reconnecting = false;
      node.ros.connect(config.url);
    }

    connect();
  }

  RED.nodes.registerType("ros-connection", connectionNode);
}
