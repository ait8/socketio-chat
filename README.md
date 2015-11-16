Node Chat
======

Chat System for small group.

- mongodb
- nodejs
- express4
- socket.io

# How to Use
Please configure your mongodb URL on `index.js`.
This configuration is near L40.
```
mongoose.connect('mongodb://path/to/mongodb-server/chatdb');
```
Then, exec these commands.

```
% npm install
% node index.js
```
