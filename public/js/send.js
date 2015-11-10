var socket = io();
var member_html = '<span></span>';

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
  var tag = msg.tag || "msg";
  var time = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', {hour: 'numeric', minute: 'numeric', second: 'numeric'})
        .format(new Date(msg.date));
  var chatmsg = '<p class="' + tag + '">'+ msg.msg +'</p>';
  return $('<li>'+
           '  <span class="name">'+ msg.name +'<span class="time">'+ time +'</span></span>'+
           chatmsg +
           '</li>');
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
  socket.emit('chat message', $('#m').val());
  $('#m').val('');
  $('form#chatForm #m').focus();
  return false;
});

$('.btn-user').popover({content: function(){return member_html;},
                        placement: 'left',
                        html: true,
                        container: 'body'});
