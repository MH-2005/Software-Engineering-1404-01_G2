import os
import django
import wikipediaapi

# تنظیمات محیط جنگو
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app404.settings')
django.setup()

from team6.models import WikiArticle, WikiCategory

def run_comprehensive_seeder():
    # تنظیم ویکی‌پدیا با User-Agent اختصاصی
    wiki = wikipediaapi.Wikipedia(
        user_agent='TourismDataBot/1.0 (contact: your@email.com)',
        language='fa'
    )

    # تعریف دسته‌بندی‌های کلان برای پروژه
    categories_map = {
        "استان‌های ایران": "استان‌ها و جغرافیا",
        "شهرهای ایران": "استان‌ها و جغرافیا",
        "جاذبه‌های گردشگری ایران": "تفریحی و گردشگری",
        "پارک‌ها در ایران": "تفریحی و گردشگری",
        "مراکز خرید در ایران": "تجاری و مدرن",
        "موزه‌های ایران": "فرهنگی",
        "طبیعت ایران": "طبیعت و اقلیم",
        "آثار ملی ایران": "تاریخی و باستانی",
        "رستوران‌های ایران": "خدمات و رفاهی"
    }

    print("🚀 شروع فرآیند استخراج داده‌های جامع...")

    for wiki_cat_name, local_cat_name in categories_map.items():
        # ۱. ساخت یا پیدا کردن دسته‌بندی در دیتابیس خودتان
        db_category, _ = WikiCategory.objects.using('team6').get_or_create(
            slug=wiki_cat_name.replace(" ", "-"),
            defaults={'title_fa': local_cat_name}
        )

        print(f"\n📂 در حال استخراج رده: {wiki_cat_name}...")
        
        cat_page = wiki.page(f"Category:{wiki_cat_name}")
        if not cat_page.exists():
            print(f"⚠️ رده {wiki_cat_name} یافت نشد.")
            continue

        # استخراج اعضای رده (محدود شده به ۱۵ مورد از هر کدام برای سرعت و تنوع)
        members = list(cat_page.categorymembers.values())[:15]

        for page in members:
            # فقط مقالات (Namespace.MAIN) را بردار، نه دسته‌بندی‌های فرعی
            if page.ns == wikipediaapi.Namespace.MAIN:
                try:
                    # ۲. ذخیره در دیتابیس تیم 6
                    # استفاده از slug منحصر به فرد با ترکیب نام برای جلوگیری از تداخل
                    unique_slug = page.title.replace(" ", "-")[:50]
                    
                    article, created = WikiArticle.objects.using('team6').get_or_create(
                        slug=unique_slug,
                        defaults={
                            'title_fa': page.title,
                            'place_name': page.title, # معمولاً عنوان مقاله نام مکان است
                            'body_fa': page.text[:3000], # متن طولانی‌تر برای محتوای واقعی
                            'summary': page.summary[:500],
                            'url': page.fullurl,
                            'category': db_category,
                            'status': 'published',
                            'view_count': 0
                        }
                    )
                    
                    if created:
                        print(f"  ✅ ثبت شد: {page.title}")
                    else:
                        print(f"  🟡 موجود بود: {page.title}")

                except Exception as e:
                    print(f"  ❌ خطا در ثبت {page.title}: {str(e)}")

    print("\n✨ عملیات با موفقیت به پایان رسید. حالا دیتابیس تیم ۶ پر از دیتای متنوع است!")

if __name__ == "__main__":
    run_comprehensive_seeder()
