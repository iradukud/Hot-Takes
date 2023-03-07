//post textarea auto resize
textarea = document.querySelectorAll(".post");
textarea.forEach(input => input.addEventListener('input', autoResize, false));

function autoResize() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
}

//trigger event to close modals
$('.close').click(function () {
    $('#commentModal').modal('hide');
    $('#postModal').modal('hide');
    $('#followerModal').modal('hide');
    $('#followingModal').modal('hide');
    $('#messageModal').modal('hide');
});

//trigger event to edit post
$('#triggerPost').click(function () {
    $('#postModal').modal('show');

    //sets form's action
    document.querySelector('#postForm').setAttribute('action', '/post/create')
    //set modals title
    document.querySelector('#postModalTitle').innerText = 'Take'
    //reset form input value
    document.querySelector('#editPost').value = ''
});

//trigger event to edit post
$('.editPostTrigger').click(function () {
    $('#postModal').modal('show');
    //extract the post's id
    const postId = this.getAttribute('class').split(' ').pop().trim()

    //sets form's action
    document.querySelector('#postForm').setAttribute('action', `/post/edit/${postId}?_method=PUT`)
    //set modals title
    document.querySelector('#postModalTitle').innerText = 'Edit Take'
    //set current input value in form
    document.querySelector('#editPost').value = document.querySelector(`#postContent-${postId}`).innerText
})

//trigger event to add comment
$('.commentTrigger').click(function () {
    $('#commentModal').modal('show');
    //extract the post's id
    const postId = this.getAttribute('class').split(' ').pop().trim()

    //sets form's action
    document.querySelector('#commentForm').setAttribute('action', `/comment/add/${postId}`)
    //set value of comment in form
    document.querySelector('#commentText').innerText = ''
})

//trigger event to edit comment
$('.editCommentTrigger').click(function () {
    $('#commentModal').modal('show');
    //extract the comment's id
    const commentId = this.getAttribute('class').split(' ').pop().trim()

    //sets form's action
    document.querySelector('#commentForm').setAttribute('action', `/comment/edit/${commentId}`)
    //set value of comment in form
    document.querySelector('#commentText').innerText = document.querySelector(`#commentContent-${commentId}`).innerText
})

//setup form to quickly search for users
$('#searchUsers').click(function () {
    //set action of form
    document.querySelector('#searchForm').setAttribute('action', '/searchUsers')
});

//setup form to quickly search for posts
$('#searchPosts').click(function () {

    //set action of form
    document.querySelector('#searchForm').setAttribute('action', '/searchPosts')
});

//trigger event to message user
$('#showMessage').click(function () {
    $('#messageModal').modal('show');
});


//trigger event to show followers
$('#showFollowers').click(function () {
    $('#followerModal').modal('show');
});

//trigger event to show following
$('#showFollowing').click(function () {
    $('#followingModal').modal('show');
});