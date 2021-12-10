
document.addEventListener('DOMContentLoaded',() => {

    var current_page = Number(document.querySelector('#current-nav-link').innerHTML)

    // check if pervious button should be disabled
    if(current_page == 1){
        document.querySelector('#previous-nav').classList.add('disabled')
    }
    
    document.querySelector('#allLink').addEventListener('click', () => {
        document.querySelector('#newPost').hidden = false
        document.querySelector('#profile-section').hidden = true
        load_postlist('all', 1)
        document.querySelector('#current-nav-link').innerHTML = 1
    });

    document.querySelector('#followingLink').addEventListener('click', () => {
        document.querySelector('#newPost').hidden = true
        document.querySelector('#profile-section').hidden = true
        load_postlist('following', 1)
        document.querySelector('#current-nav-link').innerHTML = 1
    });

    document.querySelector('#profileLink').addEventListener('click', () => {
        load_profile(JSON.parse(document.getElementById('user_username').textContent))
        document.querySelector('#current-nav-link').innerHTML = 1
    });

    document.querySelector('#newPostBtn').addEventListener('click', () => {
        newpost()
    });

    document.querySelector('#previous-nav-link').addEventListener('click', () => {
        var current_page = document.querySelector('#current-nav-link').innerHTML
        var previous_page = current_page - 1;
        if (previous_page <= 1){
            previous_page = 1
            document.querySelector('#previous-nav').classList.add('disabled')
        }else{
            document.querySelector('#previous-nav').classList.remove('disabled')
        }
        var postlist = document.querySelector('#post-section').value
        document.querySelector('#current-nav-link').innerHTML = previous_page
        load_postlist(postlist, previous_page)
    });
    
    document.querySelector('#next-nav-link').addEventListener('click', () => {
        var current_page = Number(document.querySelector('#current-nav-link').innerHTML)
        var next_page = current_page + 1;
        document.querySelector('#previous-nav').classList.remove('disabled')
        
        var postlist = document.querySelector('#post-section').value
        document.querySelector('#current-nav-link').innerHTML = next_page
        load_postlist(postlist, next_page)
    });
    

    // by default load all posts
    load_postlist('all', 1);
})


function newpost(){

    content = document.querySelector('#newPostContent').value

    fetch('/submitPost', {
        method: 'POST',
        body: JSON.stringify({
            poster_id : JSON.parse(document.getElementById('user_id').textContent),
            content :  document.querySelector('#newPostContent').value
        })
    })
    .then(response => response.json())
    .then(result => {
        load_postlist('all', 1)
    })
}

// this fn loads posts from a given postlist
function load_postlist(postlist, page){
    document.querySelector('#post-section').innerHTML = `<h3>Posts from ${postlist}</h3>`;
    document.querySelector('#post-section').value = postlist

    // fetch posts
    fetch(`/postlist/${postlist}?page=${page}`)
    .then(response => response.json())
    .then(page_obj => {
    
        page_obj.forEach(element => {
            
            var post = document.createElement('div');
            post.classList.add('post')
            var poster = document.createElement('div');
            poster.innerHTML = `<h5>${element.poster}</h5>`
            poster.addEventListener('click', () => load_profile(element.poster))
            post.appendChild(poster)

            // pull through logged it users id and username from layput.html
            const user_id = JSON.parse(document.getElementById('user_id').textContent);
            const user_name = JSON.parse(document.getElementById('user_username').textContent);
            
            // if the user is the poster
            if (user_name == element.poster){
                var editBtn = document.createElement('button');
                editBtn.id = `${element.id}editBtn`
                editBtn.innerHTML = 'edit';
                editBtn.classList.add('btn', 'btn-secondary', 'editBtn', 'btn-sm');
    
                editBtn.addEventListener('click', () => editfn(element.id))

                post.appendChild(editBtn)
            }
            
            var content = document.createElement('div');
            content.id = `${element.id}content`;
            content.classList.add('postContent');
            content.innerHTML = `<p>${element.content}</p>`
            post.appendChild(content)

            var editor = document.createElement('div');
            editor.id = `${element.id}editor`
            editor.classList.add('postEditor');
            
            post.appendChild(editor);
            editor.hidden = true;


            var textarea = document.createElement('textarea')
            textarea.name = `${element.id}editedContent`;
            textarea.classList.add('form-control');
            textarea.rows = '4';
            textarea.innerHTML = `${element.content}`
            editor.appendChild(textarea)

            var editSubmitBtn = document.createElement('button');
            editSubmitBtn.innerHTML = 'save';
            editSubmitBtn.classList.add('btn', 'btn-primary', 'editBtn');
            //editSubmitBtn.type = 'submit'
            editor.appendChild(editSubmitBtn)

            editSubmitBtn.addEventListener('click', () => saveEdit(element.id, textarea.value))

            var timestamp = document.createElement('div');
            timestamp.innerHTML = `${element.timestamp}`
            timestamp.classList.add('timestamp')
            post.appendChild(timestamp)

            if(isAuthenticated){
                var like_post = document.createElement('div')
                
                var likeBtn = document.createElement('button')
                if(user_id in element.likers || user_id == element.likers){
                    likeBtn.innerHTML = 'Unlike';
                }else{
                    likeBtn.innerHTML = 'Like';
                }
                if(user_name == element.poster){
                    likeBtn.disabled = true
                }
                
                likeBtn.id = `likeBtn${element.id}`
                likeBtn.classList.add('btn', 'btn-sm', 'btn-success')
                like_post.appendChild(likeBtn)

                var num_likes = document.createElement('div')
                num_likes.id = `num_likes${element.id}`
                num_likes.style.padding = '2px 8px';
                num_likes.innerHTML = `${element.num_likes}`;
                num_likes.style.display = 'inline';
                like_post.appendChild(num_likes)

                post.appendChild(like_post)
                like_post.addEventListener('click', () => like_toggle(element.id, user_id))
            }
        
            document.querySelector('#post-section').appendChild(post);
            
        });
    })
}

function load_profile(username){

    document.querySelector('#newPost').hidden = true
    document.querySelector('#profile-section').hidden = false
    document.querySelector('#profile-section').innerHTML = ''

    fetch(`/profile/${username}`)
    .then(response => response.json())
    .then(profile => {

        var profile_section = document.createElement('div')
        var username_section = document.createElement('div')
        username_section.innerHTML = `<h2>${profile.username}</h2>`;
        profile_section.appendChild(username_section)

        var followers = document.createElement('div')
        followers.innerHTML = `Followers: ${profile.num_followers}`
        profile_section.appendChild(followers)

        var following = document.createElement('div')
        following.innerHTML = `Following: ${profile.num_following}`
        profile_section.appendChild(following)

        // get logged in user's id to check if following or not
        const user_id = JSON.parse(document.getElementById('user_id').textContent);

        // only show follow button if user is logged in and not looking at their own profile
        if(isAuthenticated  && user_id != profile.id){

            var followBtn = document.createElement('button')
            followBtn.classList.add('btn', 'btn-primary', 'btn-sm')

            // check if the user is already following or not
            if(user_id in profile.followers || user_id == profile.followers){

                followBtn.innerHTML = 'Unfollow';
                
                followBtn.addEventListener('click', () => {
                    followBtn.innerHTML = 'Follow';
                    follow_toggle(profile.username, 'unfollow')
                })

            }else{

                followBtn.innerHTML = 'Follow';

                followBtn.addEventListener('click', () => {
                    followBtn.innerHTML = 'Unfollow';
                    follow_toggle(profile.username, 'follow')
                })
            }
            

            profile_section.appendChild(followBtn)
        }

        document.querySelector('#profile-section').appendChild(profile_section);
        load_postlist(`${profile.username}`, 1)

    })
    
}

// this fn changes the user to following/unfollowing
function follow_toggle(username, option){

    if(option == 'follow'){

        fetch(`/profile/${username}`, {
            method: 'PUT',
            body: JSON.stringify({
                follow: true
            })
        })
        .then(() => {
            load_profile(username)
        });

    }else if(option == 'unfollow'){

        fetch(`/profile/${username}`, {
            method: 'PUT',
            body: JSON.stringify({
                follow: false
            })
        })
        .then(() => {
            load_profile(username)
        });

    }else{
        console.log('error: check follow toggle')
    }
}

// this fn changes the user to following/unfollowing
function like_toggle(post_id){

    var likeBtn = document.querySelector(`#likeBtn${post_id}`)
    if(likeBtn.innerHTML == 'Like'){

        fetch(`/like/${post_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                like: true
            })
        })
        .then(() => {
            likeBtn.innerHTML = 'Unlike'
            document.querySelector(`#num_likes${post_id}`).innerHTML = Number(document.querySelector(`#num_likes${post_id}`).innerHTML) + 1
        });

    }else if(likeBtn.innerHTML == 'Unlike'){

        fetch(`/like/${post_id}`, {
            method: 'PUT',
            body: JSON.stringify({
                like: false
            })
        })
        .then(() => {
            likeBtn.innerHTML = 'Like'
            document.querySelector(`#num_likes${post_id}`).innerHTML = Number(document.querySelector(`#num_likes${post_id}`).innerHTML) - 1
        });

    }else{
        console.log('error: check like toggle')
    }
}

// this fn brings up the edit box and save button
function editfn(post_id){
    document.getElementById(post_id+'content').hidden = true
    document.getElementById(post_id+'editor').hidden = false
    document.getElementById(post_id+'editBtn').hidden = true
}

// this fn sends the new edited content to the server for saving
function saveEdit(post_id, content){

    fetch(`/edit/${post_id}`, {
        method: 'PUT',
        body: JSON.stringify({
            content: content
        })
    })
    .then(() => {
        // no page refresh
        
        document.getElementById(post_id+'content').hidden = false
        document.getElementById(post_id+'editor').hidden = true
        document.getElementById(post_id+'editBtn').hidden = false
        document.getElementById(post_id+'content').innerHTML = content
    });

    
}