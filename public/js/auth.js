//trigger event to close modals
$('.close').click(function () {
    $('#loginModal').modal('hide');
    $('#signpModal').modal('hide');
});

//trigger event to login
$('#login').click(function () {
    $('#loginModal').modal('show');
});

//trigger event to signup, step 1
$('#signup').click(function () {
    $('#signpModal').modal('show');

    //setup modal title
    document.querySelector('#signpModalTitle').innerText = 'Signup, 1 of 2';
    //hide step two content
    document.querySelectorAll('.step2').forEach(section => section.style.display = 'none');
    //show step one content
    document.querySelectorAll('.step1').forEach(section => section.style.display = 'block');

    //trigger step 2 
    $('#nextSignup').click(function () {
    //setup modal title
    document.querySelector('#signpModalTitle').innerText = 'Signup, 2 of 2';
    //hide step one content
    document.querySelectorAll('.step1').forEach(section => section.style.display = 'none');
    //show step two content
    document.querySelectorAll('.step2').forEach(section => section.style.display = 'block');
    
    //trigger step 1 again 
    $('#backSignup').click(function () {
        //setup modal title
        document.querySelector('#signpModalTitle').innerText = 'Signup, 1 of 2';
        //hide step two content
        document.querySelectorAll('.step2').forEach(section => section.style.display = 'none');
        //show step one content
        document.querySelectorAll('.step1').forEach(section => section.style.display = 'block');
    });
    });
});