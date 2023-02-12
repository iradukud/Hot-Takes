//trigger event to close modals
$('.close').click(function () {
    $('#loginModal').modal('hide');
    $('#signpModal').modal('hide');
});

//trigger event to login
$('#login').click(function () {
    $('#loginModal').modal('show');
})

//trigger event to signup
$('#signup').click(function () {
    $('#signpModal').modal('show');
})