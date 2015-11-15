<style>
 .reply-highlight {
   opacity: 1;
   -webkit-animation-duration: 1s;
   -webkit-animation-name: reply-flash;
   animation-duration: 1s;
   animation-name: reply-flash;
 }

 @-webkit-keyframes reply-flash {
   0% {
     background: #C5EFF7;
     opacity: .4;
   }
   100% {
     opacity: 1;
   }
 }
 @keyframes reply-flash {
   0% {
     background: #C5EFF7;
     opacity: .4;
   }
   100% {
     opacity: 1;
   }
 }

 .reply-link {
   font-size: 0.7rem;
   padding-right: 5px;
 }

 .reply-link:after {
   content: '：';
 }
</style>

<template>
  <li id="{{_id}}" transition="message" @mouseenter="showPopup" @mouseleave="hidePopup" class="{{class}}">
    <span class="name">
      {{name}}
      <span class="time">
        {{date | time-format}}
      </span>
      <a v-show="menu" class="reply" @click="reply">{{reply_text}}</a>
    </span>
    <p class="{{tag}}"><a class="reply-link" href="#{{reply_to}}" v-if="reply_to" @click="replyHighlight"><span class="glyphicon glyphicon-share-alt"></span>返信</a>{{msg}}</p>
  </li>
  <form v-show="reply_show" v-on:submit.prevent="onReply" class="form-inline">
    <div class="form-group">
      <input id="m" autocomplete="off" class="form-control"
             placeholder="返信を入力して下さい" v-model="content"/>
    </div>
    <button class="btn btn-primary">Reply</button>
  </form>
</template>

<script>
 module.exports = {
   name: 'Log',
   props: ['_id', 'name', 'date', 'tag', 'msg', 'reply_to'],
   data: function(){
     return {
       menu: false,
       reply_show: false,
       reply_text: '返信',
       content: ''
     };
   },
   methods: {
     showPopup: function(e){
       this.menu = true;
     },
     hidePopup: function(e){
       this.menu = false;
     },
     reply: function(e){
       if (this.reply_show === false) {
         this.reply_show = true;
         this.reply_text = 'キャンセル';
       } else {
         this.reply_show = false;
         this.reply_text = '返信';
         this.content = '';
       }
     },
     onReply: function(e){
       var socket = require('./socket.js');
       socket.emit('chat message', {reply_to: this._id, msg: this.content});
       this.reply_show = false;
       this.reply_text = '返信';
       this.content = '';
       $('#m').focus();
     },
     replyHighlight: function(e) {
       $('#'+this.reply_to).addClass('reply-highlight');
       var that = this;
       setTimeout(function(){
         $('#'+that.reply_to).removeClass('reply-highlight', {duration: 400});
       }, 400);
     }
   }
 }
</script>
