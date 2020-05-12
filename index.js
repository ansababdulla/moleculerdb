"use strict";

const { ServiceBroker } = require("moleculer");
const DbService = require("moleculer-db");
const HTTPServer = require("moleculer-web");
const MongoDBAdapter = require("moleculer-db-adapter-mongo");


// Create the broker for node-1
// Define nodeID and set the communication bus
const brokerNode1 = new ServiceBroker({
    nodeID: "node-1",
    transporter: "NATS"
  });


  // Create the "gateway" service
brokerNode1.createService({
    // Define service name
    name: "gateway",
    // Load the HTTP server
    mixins: [HTTPServer],
  
    settings: {
      routes: [
        {
          aliases: {
            // When the "GET /products" request is made the "listProducts" action of "products" service is executed
            "GET /user": "posts.createUser",
            "GET /list" : "posts.listUser",
            "GET /update/" : "posts.updateUser",
            "GET /delete/" : "posts.deleteUser"

          }
        }
      ]
    }
  });

// Create the broker for node-2
// Define nodeID and set the communication bus
const brokerNode2 = new ServiceBroker({
    nodeID: "node-2",
    transporter: "NATS"
});

// Create a Mongoose service for `post` entities
brokerNode2.createService({
    name: "posts",
    mixins: [DbService],
    adapter: new MongoDBAdapter("mongodb+srv://user:user@nodetodo-boust.mongodb.net/test?retryWrites=true&w=majority", { keepAlive : 1}),
    collection: "posts",
    actions : {
        createUser() {
            return [
                brokerNode2.call("posts.create", {
                    title: "My first post",
                    content: "Lorem ipsu...",
                    votes: 0
                }).then(console.log)
            ]
        },
        listUser() {
            return [
                brokerNode2.call("posts.find")
                .then(console.log)
            ]
        },
        updateUser() {
            return [
                brokerNode2.call("posts.update", { id: "5eba5eaaa2355f0bccb75160", title: "Ansab Abdulla" }).
                then(console.log)
            ]
        },
        deleteUser() {
            return [
                brokerNode2.call("posts.remove", { id: "5eba5eaaa2355f0bccb75160" }).
                then(console.log)
            ]
        }
    }
});

Promise.all([brokerNode1.start(), brokerNode2.start()]);
// broker.start()
// // Create a new post
// .then(() => brokerNode2.call("posts.create", {
//     title: "My first post",
//     content: "Lorem ipsu...",
//     votes: 0
// }))

// // Get all posts
// .then(() => broker.call("posts.find").then(console.log));

// // //Update post
// // broker.start() 
// // .then(() => broker.call("posts.update", { id: "5eba36035886df0c08d84923", title: "Ansab Doe" }).then(console.log));

// // // Delete a user
// // broker.start()
// // .then(() => broker.call("posts.remove", { id: "5eba3af01b2bcf25dc71220c" }).then(console.log));