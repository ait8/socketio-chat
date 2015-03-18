var socket = io();

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

socket.on('chat message', function(msg){
  $('<li>'+
    '  <span class="name">'+ msg.name +'</span>'+
    '  <span class="msg">'+ msg.msg +'</span>'+
    '</li>').appendTo('#messages').hide().fadeIn(300);
    $('#messages').scrollTop($('#messages')[0].scrollHeight);
});

socket.on('member list', function(msg){
  $('#members').html('');

  for (var i = 0; i < msg.length; i++) {
    $('<li>').text(msg[i].name).appendTo('#members').hide().fadeIn(300);
  }
});

socket.on('chat logs', function(msg){
  for (var i = 0; i < msg.length; i++) {
    $('#messages').append($('<li>'+
                             '  <span class="name">'+ msg[i].name +'</span>'+
                             '  <span class="msg">'+ msg[i].msg +'</span>'+
                            '</li>')).scrollTop($('#messages')[0].scrollHeight);
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
  return false;
});
