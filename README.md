# Distributed-intelligent-production-involving-remote-actors
Project work 2020 https://wiki.aalto.fi/display/AEEproject/Distributed+intelligent+production+involving+remote+actors  

## Node-RED ROS integration

> Node-RED ROS (Robot Operating System) integration via rosbridge suite

## Installation

First install [Node.js](https://nodejs.org/en/download). It is recommended to install the latest LTS version. Then install [Node-RED](https://nodered.org/) globally, for example, by using the command-line tool <em>npm</em>.
<pre><code>  $ sudo npm install -g --unsafe-perm node-red</code></pre>
Next, change to Node-RED directory at <em>~/.node-red</em> and install nodes provided by this repository using <em>npm</em>.
<pre><code>  $ npm install /path/to/repository</code></pre>
Finally, start Node-RED by running the command <em>node-red</em> from the command-line. By default the command will start a server at <em>localhost:1880</em>. Pointing a web browser to the aforementioned location will open Node-RED editor, which is used for developing web applications.

Optionally, Node-RED server can be accessed from a remote location by configuring <em>uiHost</em> variable in Node-RED configuration file. The configuration file is located at <em>~/.node-red/settings.js</em>. Set the value of the variable to the local IP address to enable access to the server from other machines in the same network. If access from a different network is required, then incoming traffic to port 1880 must be routed to the local IP address.

## Running an application

A web application can be created in the Node-RED editor. In-depth guide for creating Node-RED applications is available [here](https://nodered.org/docs/user-guide). Applications can be imported and exported as JSON files. This repository provides an example application (<em>examples/mir-integration.json</em>). Running the example application consists of the following steps:

  1. Install prerequisite ROS packages
  2. Install dependencies (nodejs packages)
  3. (Re)start Node-RED server
  4. Import the example flow
  5. Launch ROS nodes
  6. Deploy the example flow
  7. Access the Node-RED dashboard

1) Running the example application requires a full ROS installation, MiR 100 package and rosbridge suite. ROS installation is documented [here](https://wiki.ros.org/ROS/Installation), and MiR 100 package installation is documented [here](https://github.com/dfki-ric/mir_robot). It is recommended to use the binary install for MiR 100 package unless source code of the project must be modified. The command below installs rosbridge suite; modify the command accordingly if ROS Melodic is not the target distribution.
<pre><code>  $ sudo apt install ros-melodic-rosbridge-suite</code></pre>

2) Dependencies can be installed using the Node-RED editor or with <em>npm</em>. Installing dependencies using the editor is documented [here](https://nodered.org/docs/user-guide/editor/palette/manager). Running the example application only requires <em>node-red-dashboard</em>. Below are the commands used for installing the dependency using <em>npm</em>.
<pre><code>  $ cd ~/.node-red
  $ npm install node-red-dashboard</code></pre>

3-4) (Re)start Node-RED and then import the example application (<em>examples/mir.json</em>) as documented [here](https://nodered.org/docs/user-guide/editor/workspace/import-export).

5) Next, all required ROS nodes must be started and physics shall then be unpaused in the Gazebo simulation. Follow the instructions [here](https://github.com/dfki-ric/mir_robot) under the <em>Gazebo demo (existing map)</em> header to start MiR 100 specific ROS nodes. Then run rosbridge with the command shown below.
<pre><code>  $ roslaunch rosbridge_server rosbridge_websocket.launch</code></pre>
Alternatively, a custom launch file provided by this repository (at <em>mir/mir.launch</em>) may be used to launch all of the required nodes. Gazebo physics shall be unpaused after running the custom launch file.
<pre><code>  $ rosservice call /gazebo/unpause_physics</code></pre>

6-7) If no fatal errors occurred, the example application may be started from the Node-RED editor by clicking the deploy button located at the upper right corner of the editor. The application provides a user interface, which is accessed by pointing a web browser to <em>localhost:1880/ui</em> (use the Node-RED server IP address specified in the previous Section).

## Node-RED nodes

> Node descriptions for the Node-RED nodes provided by this repository

### ros-connection

<em>ros-connection</em> is a Node-RED configuration node, which handles the connection with rosbridge server. It is used by other nodes and must be configured before deploying any of the other nodes. The node is configured by specifying the rosbridge websocket server URL, which is by default <em>ws://localhost:9090</em>. The default URL should work, and it is not necessary to expose the websocket server to public Internet as it is only accessed locally by the Node-RED application.

### ros-publisher

<em>ros-publisher</em> node is used for publishing messages to ROS topics via rosbridge server. The node is configured by specifying a <em>ros-connection</em> node, ROS topic name and ROS message type. Input payload to the node will be published to the specified ROS topic. User of the node shall ensure that the payload is in correct JSON format, that is, the payload corresponds to the specified ROS message type. For example, correct JSON payload format for <em>geometry_msgs/Pose</em> would be
<pre><code>  {
    position: {
      x = 0.0,
      y = 0.0,
      z = 0.0
    },
    orientation: {
      x = 0.0,
      y = 0.0,
      z = 0.0,
      w = 0.0
    }
  }</code></pre>

### ros-subscriber

<em>ros-subscriber</em> node is used for subscribing to ROS topics via rosbridge server. The node is configured by specifying a <em>ros-connection</em> node and name of the topic to subscribe to. Optionally, throttle rate (in milliseconds) may be specified; messages will not be read faster than the specified rate.

Additional information about nodes <em>ros-publisher</em> and <em>ros-subscriber</em> can be found in the Node-RED editor.

## Issues

In order to integrate Gazebo 3D view with Node-RED, <em>gzweb</em> needs to be installed as per instructions found [here](http://gazebosim.org/gzweb#gzweb_installation). However, as of writing this document, <em>gzweb</em> requires <em>nodejs</em> version 8 or older (down to version 4), but Node-RED no longer supports <em>nodejs</em> versions 8 or earlier.
