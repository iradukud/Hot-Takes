//post textarea auto resize
textarea = document.querySelector(".post");
textarea.addEventListener('input', autoResize, false);

function autoResize() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}

//trigger event to close modals
$('.close').click(function () {
    $('#commentModal').modal('hide');

});

//trigger event to add comment
$('.commentTrigger').click(function () {
    $('#commentModal').modal('show');

    //place current post's id into the forms
    document.querySelector('#postId').value= this.getAttribute('class').split(' ').pop().trim()
})
