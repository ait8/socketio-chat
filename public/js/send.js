var socket = io();
var member_html = '<span></span>';
var question_list = [];
var reply_to = '';

$('form#enterForm #name').focus();

$('form#enterForm').submit(function(){
  if ($('#name').val() === '') {
    return false;
  }
  $.post("/users/" + $('#name').val(), function(data){
    if (data.type === "error") {
      $('.flash').html(data.msg).fadeIn(300);
    } else {
      socket.emit('enter room', $('#name').val());
      $('#name').val('');
      $('.enter-dialog').fadeOut(300);
      $('form#chatForm #m').focus();
      $('.flash').fadeOut(300);
    }
  });
  return false;
});

var createMessage = function(msg) {
  if (msg.question) {
    question_list.push({id: msg._id, content: msg.msg.substr(0, 15) + '……'});
  }

  var tag = msg.tag || "msg";
  var time = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {hour: 'numeric', minute: 'numeric', second: 'numeric'})
        .format(new Date(msg.date));
  var reply = '';
  if (msg.reply_to && msg.reply_to !== ''){
    reply = '<a class="reply-link" href="#'+ msg.reply_to +'"><span class="glyphicon glyphicon-share-alt"></span>返信:</a>';
  }
  var chatmsg = '<p class="' + tag + '">'+ reply +msg.msg +'</p>';
  return $('<li id="'+ msg._id +'">'+
           '  <span class="name">'+ msg.name +'<span class="time">'+ time +'</span><a class="reply">返信</a></span>'+
           chatmsg +
           '</li>').on('click', '.reply', function(event){
             $('li .reply').parents('li').removeClass('reply-mode');
             $('li .reply').html('返信');
             var parent = $(this).parents('li');
             var target = parent.get(0).id;
             if (reply_to === '' || reply_to !== target) {
               reply_to = target;
               parent.addClass('reply-mode');
               $('body').scrollTop(parent.offset().top - $(window).height() + $('#chatForm').height() + parent.height());
               $(this).html('キャンセル');
               $('#chatForm button')
                 .addClass('btn-primary')
                 .removeClass('btn-success')
                 .html('Reply');
             } else {
               $('#chatForm button')
                 .removeClass('btn-primary')
                 .addClass('btn-success')
                 .html('Send');
               reply_to = '';
             }
           });
};

socket.on('chat message', function(msg){
  var bottoms = false;
  if ($('#message-box').height() <=
      $('body').scrollTop() + $('body').height()){
        // || $('.readonly').length === 1) {
    bottoms = true;
  }
  createMessage(msg).appendTo('.messages').hide().fadeIn(300);
  if (bottoms) {
    $('body').scrollTop($('.messages')[0].scrollHeight);
  }
});

socket.on('member list', function(msg){
  $('#members').html('');
  var members = '';
  for (var i = 0; i < msg.length; i++) {
    members += '<div class="member">' + msg[i].name + '</div>';
  }
  $('.btn-user .num').html(msg.length);
  member_html = members;
});

socket.on('chat logs', function(msg){
  for (var i = 0; i < msg.length; i++) {
    $('.messages').append(createMessage(msg[i]));
    $('body').scrollTop($('.messages')[0].scrollHeight);
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

$('form#chatForm').submit(function(){
  socket.emit('chat message', {reply_to: reply_to, msg: $('#m').val()});
  $('#m').val('');
  if (reply_to !== '') {
    $('li .reply').parents('li').removeClass('reply-mode');
    $('li .reply').html('返信');
    $('#chatForm button')
      .removeClass('btn-primary')
      .addClass('btn-success')
      .html('Send');
    reply_to = '';
  }
  $('form#chatForm #m').focus();
  return false;
});

$('.btn-user').popover({content: function(){return member_html;},
                        placement: 'left',
                        html: true,
                        container: 'body',
                        trigger: 'focus'});

$('.btn-question').popover({
  content: function(){
    var html = '';
    for (var i = 0; i < question_list.length; i++) {
      html += '<a href="#'+ question_list[i].id +'" class="questions">' + question_list[i].content + '</a>';
    }
    return html;
  },
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
