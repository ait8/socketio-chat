<style>
 .tool-box {
   padding: 10px;
   position: fixed;
   right: 0;
   z-index: 1009;
   vertical-align: middle;
 }

 .tool-box .num{
   display: block;
 }

 .tool-box div{
   margin: 6px;
 }

 .btn-circle {
   position: relative;
   width: 60px;
   height: 60px;
   border-radius: 50%;
   vertical-align: middle;
   display: table-cell;
   text-align: center;
   vertical-align: middle;
 }

 .btn-circle span {
 }

 .tool-box .btn {
   background: #FFF;
   box-shadow:rgba(113, 135, 164, 0.25) 0px 0px 3px 2px;
   outline: none;
 }

 .btn-user {
   background: #FFF;
   color: #89C4F4;
 }

 .btn-user:hover {
   color: #FFF;
   background: #89C4F4;
 }

 .btn-question {
   background: #FFF;
   color: #CF000F;
 }

 .btn-question:hover {
   color: #FFF;
   background: #CF000F;
 }

 .member {
   padding: 1px;
 }

 .member:before {
   color: #87D37C;
   content: "●";
   padding-right: 5px;
 }

 .questions {
   display: block;
 }
 .btn-realtime {
   background: #FFF;
   color: #F9690E;
   opacity: 0.7;
 }
 .btn-realtime:hover {
   color: #FFF;
   background: #F9690E;
   opacity: 1;
 }
 .btn-realtime.active {
   color: #FFF;
   background: #F9690E;
   opacity: 1;
 }
</style>

<template>
  <div class="tool-box">
    <div v-if="readonly">
      <button class="btn btn-circle btn-realtime {{active}}" @click="realtimeMode">
        <span class="glyphicon glyphicon-refresh"></span>
      </button>
    </div>
    <div v-if="!readonly">
      <a class="btn btn-circle btn-user" tabindex="0">
        <span class="glyphicon glyphicon-user"></span>
        <span class="num">{{members.length}}</span></a>
      <div id="memberList" class='hide'>
        <div class="member" v-for="member in members">{{member.name}}</div>
      </div>
    </div>
    <div v-if="!readonly">
      <a class="btn btn-circle btn-question" tabindex="0" >
        <span class="glyphicon glyphicon-question-sign"></span></a>
      <div id="questionList" class='hide'>
        <a class="questions" v-for="question in questions" href="#{{question.id}}">{{question.content}}</a>
      </div>
    </div>
  </div>
</template>

<script>
 module.exports = {
   props: ['readonly'],
   data: function() {
     return {
       members: [],
       questions: [],
       active: '',
       active_func: ''
     };
   },
   created: function() {
     var that = this;
     var socket = require('./socket.js');
     socket.on('member list', function(msg){
       that.members = msg;
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
     realtimeMode: function() {
       if (this.active === '') {
         this.active = 'active';
         this.active_func = setInterval(function(){
           $(window).scrollTop($('.messages')[0].scrollHeight);
         }, 500);
       } else {
         clearInterval(this.active_func);
         this.active = '';
         this.active_func = '';
       }
     }
   }
 };
</script>
