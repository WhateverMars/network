from time import time
from django.contrib.auth import authenticate, login, logout
from django.core import paginator
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http.response import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.views.decorators.csrf import csrf_exempt
import json


from .models import Post, User


def index(request):
    return render(request, 'network/index.html')

# this fn saves new posts to the db
@csrf_exempt
def submitPost(request):
    
    # method must be POST to submit
    if request.method != 'POST':
        return JsonResponse({'error': 'POST request required'})

    # get data from json
    data = json.loads(request.body)
    poster_id = data.get('poster_id')

    # check if poster is valid
    try:
        poster = User.objects.get(id = poster_id)
    except User.DoesNotExist:
        return JsonResponse({'error':'User with id '+str(id)+' does not exist.'}, status=400)

    # save post to db
    content = data.get('content')
    post = Post.objects.create(poster = poster, content = content)
    post.save()

    return JsonResponse({'message':'Post submitted successfully'}, status=201)

# this fn returns a list of 10 posts for the given postlist
def postlist(request, postlist):
    
    page_number = request.GET.get('page', 1)
    
    # this is for viewing all posts
    if postlist == 'all':
        posts = Post.objects.order_by('-timestamp').all()
        
    # this is for viewing only people the user is following
    elif postlist == 'following':
        users_followed = request.user.following.all()
        posts = Post.objects.order_by('-timestamp').filter(poster__in=users_followed)
    
    # this is for viewing one profile
    elif User.objects.get(username = postlist):
        profile = User.objects.get(username = postlist)
        posts = Post.objects.order_by('-timestamp').filter(poster = profile)

    else:
        return JsonResponse({'error': 'Invalid postlist'}, status = 400)
    
    paginator = Paginator(posts, 10)
    
    page_obj = paginator.get_page(page_number)

    return JsonResponse([post.serialize() for post in page_obj], safe=False)


# this fn retrieves profile data and also controls the follow/unfollow toggle
@csrf_exempt
def profile(request, username):

    page_number = request.GET.get('page', 1)

    profile = User.objects.get(username = username)

    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("follow") is not None:
            if data["follow"]:
                profile.followers.add(request.user)
            else:
                profile.followers.remove(request.user)
        
        profile.save()
        return HttpResponse(status=204)

    return JsonResponse(profile.serialize(), safe=False)
   

# this fn allows the user to like/unlike the post
@csrf_exempt
def like(request, post_id):

    # get the post object
    post = Post.objects.get(id=post_id)

    if request.method == "PUT":
        data = json.loads(request.body)
        if data.get("like") is not None:
            if data["like"]:
                post.likers.add(request.user)
                post.num_likes += 1
            else:
                post.likers.remove(request.user)
                post.num_likes -= 1
        
        post.save()
        return HttpResponse(status=204)

    
# this fn allows the user to edit posts
@csrf_exempt
def edit(request, post_id):

    # get the post object
    post = Post.objects.get(id=post_id)

    if request.method == "PUT":

        # someone is hacking
        if post.poster != request.user:
            return JsonResponse({'error':'You do not have authorisation to edit post'}, status=400)
            
        # get the json data and save the new content
        data = json.loads(request.body)
        if data.get("content") is not None:
            post.content = data.get("content")
            post.save()
        
        
        return HttpResponse(status=204)
 


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
