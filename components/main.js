var Log = require('./Log.vue');

// var socket = io();
var socket = require('./socket.js');
var member_html = '<span></span>';
var question_list = [];
var reply_to = '';


$('form#enterForm #name').focus();

Vue.filter('time-format', function(date) {
  return new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {hour: 'numeric', minute: 'numeric', second: 'numeric'})
    .format(new Date(date));;
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
      $.post("/users/" + name, function(data){
        if (data.type === "error") {
          $('.flash').html(data.msg).fadeIn(300);
        } else {
          socket.emit('enter room', name);
          this.name = '';
          $('.enter-dialog').fadeOut(300);
          $('form#chatForm #m').focus();
          $('.flash').fadeOut(300);
        }
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

var memberList = new Vue({
  el: '#memberList',
  data: {
    members: []
  }
});

  // var reply = '';
  // if (msg.reply_to && msg.reply_to !== ''){
  //   reply = '<a class="reply-link" href="#'+ msg.reply_to +'"><span class="glyphicon glyphicon-share-alt"></span>返信:</a>';
  // }
  // var chatmsg = '<p class="' + tag + '">'+ reply +msg.msg +'</p>';
  // return $('<li id="'+ msg._id +'">'+
  //          '  <span class="name">'+ msg.name +'<span class="time">'+ time +'</span><a class="reply">返信</a></span>'+
  //          chatmsg +
  //          '</li>').on('click', '.reply', function(event){
  //            $('li .reply').parents('li').removeClass('reply-mode');
  //            $('li .reply').html('返信');
  //            var parent = $(this).parents('li');
  //            var target = parent.get(0).id;
  //            if (reply_to === '' || reply_to !== target) {
  //              reply_to = target;
  //              parent.addClass('reply-mode');
  //              $('body').scrollTop(parent.offset().top - $(window).height() + $('#chatForm').height() + parent.height());
  //              $(this).html('キャンセル');
  //              $('#chatForm button')
  //                .addClass('btn-primary')
  //                .removeClass('btn-success')
  //                .html('Reply');
  //            } else {
  //              $('#chatForm button')
  //                .removeClass('btn-primary')
  //                .addClass('btn-success')
  //                .html('Send');
  //              reply_to = '';
  //            }
//          });

var questionList = new Vue({
  el: '#questionList',
  data: {
    questions: []
  }
});

var insertMessage = function(msg){
  chatLogs.$data.logs.push(msg);
  if (msg.question) {
    questionList.$data.questions.push({id: msg._id, content: msg.msg.substr(0, 15) + '……'});
  }
};

socket.on('chat logs', function(msg){
  for(var i = 0, l = msg.length; i < l; ++i) {
    insertMessage(msg[i]);
  }
  Vue.nextTick(function(){
    $('body').scrollTop($('.messages')[0].scrollHeight);
  });
});

socket.on('chat message', function(msg){
  var bottoms = false;
  if ($('#message-box').height() <=
      $('body').scrollTop() + $('body').height()){
        // || $('.readonly').length === 1) {
    bottoms = true;
  }

  insertMessage(msg);

  if (bottoms) {
    Vue.nextTick(function(){
      $('body').scrollTop($('.messages')[0].scrollHeight);
    });
  }
});

socket.on('member list', function(msg){
  memberList.$data.members = msg;
  $('.btn-user .num').html(msg.length);
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

// $('form#chatForm').submit(function(){
//   socket.emit('chat message', {reply_to: reply_to, msg: $('#m').val()});
//   $('#m').val('');
//   if (reply_to !== '') {
//     $('li .reply').parents('li').removeClass('reply-mode');
//     $('li .reply').html('返信');
//     $('#chatForm button')
//       .removeClass('btn-primary')
//       .addClass('btn-success')
//       .html('Send');
//     reply_to = '';
//   }
//   $('form#chatForm #m').focus();
//   return false;
// });

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


$('body').on('shown.bs.popover', function(event){
  $('.messages li').removeClass('question-flash');
  $('.questions').on('click', function(event){
    var target = $(this).attr('href');
    $(target).addClass('question-flash');
  });
});
