<template>
  <div class="tool-box">
    <div>
      <a class="btn btn-circle btn-user" tabindex="0">
        <span class="glyphicon glyphicon-user"></span>
        <span class="num">{{members.length}}</span></a>
    </div>
    <div>
      <a class="btn btn-circle btn-question" tabindex="0" >
        <span class="glyphicon glyphicon-question-sign"></span></a>
    </div>
  </div>
  <div id="memberList" class='hide'>
    <div class="member" v-for="member in members">{{member.name}}</div>
  </div>

  <div id="questionList" class='hide'>
    <a class="questions" v-for="question in questions" href="#{{question.id}}">{{question.content}}</a>
  </div>
</template>

<script>
 module.exports = {
   data: function() {
     return {
       members: [],
       questions: []
     };
   },
   created: function() {
     var that = this;
     var socket = require('./socket.js');
     socket.on('member list', function(msg){
       console.log(msg);
       that.members = msg;
       console.log(that.members);
     });

     var insertQuestion = function(msg){
       if (msg.question) {
         that.questions.push({id: msg._id, content: msg.msg.substr(0, 15) + '……'});
       }
     };

     socket.on('chat logs', function(msg){
       for(var i = 0, l = msg.length; i < l; ++i) {
         insertQuestion(msg[i]);
       }
     });
     socket.on('chat message', function(msg){
       insertQuestion(msg);
     });

     Vue.nextTick(function(){
       $('.btn-user').popover({content: function(){return $('#memberList').html();},
                               placement: 'left',
                               html: true,
                               container: 'body',
                               trigger: 'focus'});
       $('.btn-question').popover({
         content: function(){return $('#questionList').html();},
         placement: 'left',
         html: true,
         container: 'body',
         trigger: 'focus'});
     });
   },
   methods: {
     showMembers: function() {
       console.log('click');
     }
   }
 };
</script>
