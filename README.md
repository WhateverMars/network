# Project 4: Network

This project was an assignment from Harvard's CS50w course. The assignment was to design and build a 'twitter-like' social network website. The web app is built in the django framework.

## Functions

The login and register paths and functions were provided but the rest had to be built using a combination of Python and JavaScript. Once a user has registered they are taken to the all posts page. This page displays 10 posts at a time sorted by most recent and uses Django's Paginator class to limit the view to 10 at a time. At the top of the page is a section for the user to write a new post and submit it. Once submitted it will appear below at the top of the list of all other posts. On this page the user can 'like' any post from other users and also edit posts of their own without the need to refresh the page. This was achieved using JSON to asyncronously update the database. 
The user can also click on any posters username to be taken to their profile page where they can see a list of all their posts and also view information such as how many followers they have and how many people they're following. Here the user can toggle a button to follow/unfollow that user. By clicking on the 'Following' link in the nav bar the user can view a page of posts from only the people they're following.

## Demo

A video of the website and several functions can be viewed at the below youtube link.

https://youtu.be/pi3zDOAGOMA