from team2.models import Article, Tag

def tag_article(article_name):
    article = Article.objects.get(name=article_name)
    version = article.current_version
    if version is None:
        return

    content = version.content


def summarize_article(article_name):
    article = Article.objects.get(name=article_name)
    version = article.current_version
    if version is None:
        return

    content = version.content
