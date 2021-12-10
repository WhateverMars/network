from django.contrib.auth.models import AbstractUser
from django.db import models



class User(AbstractUser):
    followers = models.ManyToManyField('self', related_name= 'following', blank=True, symmetrical=False )

    def serialize(self):
        return{
            'id' : self.id,
            'username' : self.username,
            'followers' : [self.id for self in self.followers.all()],
            'following' : [self.id for self in self.following.all()],
            'num_followers' : self.followers.count(),
            'num_following' : self.following.count()
        }

class Post(models.Model):
    poster = models.ForeignKey(User, related_name = 'created_posts', on_delete=models.CASCADE)
    num_likes = models.IntegerField(default=0)
    likers = models.ManyToManyField(User, related_name='liked_posts', blank=True)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return{
            'id' : self.id,
            'poster' : self.poster.username,
            'num_likes' : self.num_likes,
            'likers' : [user.id for user in self.likers.all()],
            'content' : self.content,
            'timestamp' : self.timestamp.strftime("%d %b %Y, %I:%M %p")
        }