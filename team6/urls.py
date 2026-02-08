from django.urls import path, include,re_path
from . import views

urlpatterns = [
    path("", views.ArticleListView.as_view(), name="article_list"),
    path("ping/", views.ping, name="ping"),
    path("add/", views.ArticleCreateView.as_view(), name="article_add"),
    # path("article/<slug:slug>/", views.article_detail, name="article_detail"),
    # re_path(r'^article/(?P<slug>[-\w]+)/$', views.article_detail, name='article_detail'),
    # path("article/<slug:slug>/edit/", views.edit_article, name="article_edit"),
    # path("article/<slug:slug>/revisions/", views.article_revisions, name="article_revisions")
    re_path(r'^article/(?P<slug>[^/]+)/$', views.article_detail, name='article_detail'),
    
    # برای سایر مسیرهای دارای اسلاگ هم همین تغییر را اعمال کنید
    re_path(r'^article/(?P<slug>[^/]+)/edit/$', views.edit_article, name="article_edit"),
    re_path(r'^article/(?P<slug>[^/]+)/revisions/$', views.article_revisions, name="article_revisions"),
    path("article/<uuid:pk>/report/", views.report_article, name="article_report"),
    # path("article/<uuid:pk>/ai-summary/", views.get_llm_summary, name="ai_summary"),
    path("api/wiki/content", views.get_wiki_content, name="external_api"),
]
