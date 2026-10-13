from django.contrib import admin
from django.urls import path
from guides.views import GuideList, GuideDetail
from editorial import views as editorial
urlpatterns = [path('admin/', admin.site.urls), path('api/guides/', GuideList.as_view()),
               path('api/guides/<slug:slug>/', GuideDetail.as_view()),
               path('api/explore/articles/', editorial.ArticleList.as_view()),
               path('api/explore/articles/<slug:slug>/', editorial.ArticleDetail.as_view()),
               path('api/explore/courses/', editorial.CourseList.as_view()),
               path('api/explore/courses/<slug:slug>/', editorial.CourseDetail.as_view()),
               path('api/explore/directory/', editorial.DirectoryList.as_view()),
               path('api/explore/directory/<slug:slug>/', editorial.DirectoryDetail.as_view())]
