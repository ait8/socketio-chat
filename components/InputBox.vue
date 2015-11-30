<style>
 #chatForm {
   height: auto;
   border-radius: 2px;
   z-index: 99;
   background: #FFF;
   padding: 3px;
   position: fixed;
   bottom: 0;
   width: calc(100% - 20px);
 }
</style>

<template>
  <form action="" id="chatForm" v-on:submit.prevent="onSubmit">
    <div class="container-fluid">
      <div class="row">
        <div class="form-group col-md-11 col-xs-8">
          <input id="m" autocomplete="off" class="form-control"
                 placeholder="メッセージを入力して下さい" v-model="content"/>
        </div>
        <div class="form-group col-md-1 col-xs-4">
          <button class="btn btn-block btn-success">Send</button>
        </div>
      </div>
    </div>
  </form>
</template>

<script>
 var socket = require('./socket.js');
 module.exports = {
   data: function(){
     return {
       content: ''
     };
   },
   methods: {
     onSubmit: function(){
       socket.emit('chat message', {reply_to: '', msg: this.content});
       this.content = '';
       $('#m').focus();
     }
   }
 };
</script>
