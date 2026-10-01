from django.contrib import admin
from django.urls import path
from guides.views import GuideList, GuideDetail
urlpatterns = [path('admin/', admin.site.urls), path('api/guides/', GuideList.as_view()),
               path('api/guides/<slug:slug>/', GuideDetail.as_view())]
