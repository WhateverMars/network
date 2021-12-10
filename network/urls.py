
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),


    path('like/<int:post_id>', views.like, name='like'),
    path('profile/<str:username>', views.profile, name='profile'),
    path('edit/<int:post_id>', views.edit, name='edit'),
    path('submitPost', views.submitPost, name='submitPost'),
    path('postlist/<str:postlist>', views.postlist, name='postlist'),
    path('profile/<str:profile>', views.profile, name='profile')
]
