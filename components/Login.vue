<style>
 #enterForm {
   border-radius: 2px;
   z-index: 1001;
   background: #FFF;
   box-shadow:rgba(113, 135, 164, 0.65) 0px 0px 6px 3px;
   padding: 10px;
   position: fixed;
   width: 200px;
   top: 30%;
   height: auto;
   left: calc(50% - 100px);
 }
</style>

<template>
  <form id="enterForm" class="enter-dialog" v-on:submit.prevent="onSubmit">
    <div class="form-group">
      <label for="name">あなたの名前</label>
      <input id="name" type="text" class="form-control" autocomplete="off"
             placeholder="あなたの名前" v-model="name" />
    </div>
    <div class="form-group">
      <button class="btn btn-block btn-success">入室</button>
    </div>
  </form>
  <div class="enter-dialog" id="layer"></div>
</template>

<script>
 var socket = require('./socket.js');
 module.exports = {
   data: function() {
     return {
       name: $.cookie('name')
     };
   },
   created: function() {
     Vue.nextTick(function(){
       $('form#enterForm #name').focus();
     });
   },
   methods: {
     onSubmit: function() {
       var name = this.name;
       if (name === '') {
         return;
       }
       $.post("/users/" + name)
        .done(function(data){
          socket.emit('enter room', name);
          this.name = '';
          $('.enter-dialog').fadeOut(300);
          $('form#chatForm #m').focus();
          $('.flash').fadeOut(300);
        }).fail(function(error){
          $('.flash').html(error.responseJSON.msg).fadeIn(300);
        });
     }
   }
 };
</script>
