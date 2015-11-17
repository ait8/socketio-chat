var Log = require('./Log.vue'),
    ToolBox = require('./ToolBox.vue');

Vue.component('log', Log);
Vue.component('toolbox', ToolBox);

// var socket = io();
var socket = require('./socket.js');

$('form#enterForm #name').focus();

Vue.filter('time-format', function(date) {
  var pad = function(num){return ('0' + num).slice( -2 );};
  var d = new Date(date);
  return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
});

var login = new Vue({
  el: '#enterForm',
  data: {
    name: $.cookie('name')
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
});

var chatForm = new Vue({
  el: '#chatForm',
  data: {
    content: ''
  },
  methods: {
    onSubmit: function(){
      socket.emit('chat message', {reply_to: '', msg: this.content});
      this.content = '';
      $('#m').focus();
    }
  }
});

var chatLogs = new Vue({
  el: '#message-box',
  data: {
    logs: []
  },
  components: {
    'log' : Log
  }
});

var insertMessage = function(msg){
  chatLogs.$data.logs.push(msg);
};

socket.on('chat logs', function(msg){
  for(var i = 0, l = msg.length; i < l; ++i) {
    insertMessage(msg[i]);
  }
  Vue.nextTick(function(){
    $(window).scrollTop($('.messages')[0].scrollHeight);
  });
});

socket.on('chat message', function(msg){
  var bottoms = false;
  if ($('#message-box').height() <=
      $(window).scrollTop() + $(window).height()){
        // || $('.readonly').length === 1) {
    bottoms = true;
  }

  insertMessage(msg);
  if (bottoms) {
    Vue.nextTick(function(){
      $(window).scrollTop($('.messages')[0].scrollHeight);
    });
  }
});

var flash = undefined;

socket.on('system', function(msg){
  if (flash !== undefined ) clearTimeout(flash);

  $('.flash').html(msg).fadeIn(200);
  flash = setTimeout(function(){
    $('.flash').fadeOut(300);
    flash = undefined;
  }, 2000);
});

$('body').on('shown.bs.popover', function(event){
  $('.messages li').removeClass('question-flash');
  $('.questions').on('click', function(event){
    var target = $(this).attr('href');
    $(target).addClass('question-flash');
  });
});

new Vue({
  el: '#main'
});
