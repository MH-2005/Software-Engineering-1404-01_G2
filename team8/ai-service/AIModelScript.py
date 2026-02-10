import os
from pyexpat import model
from PIL import Image
from tqdm import tqdm


import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import transforms, utils
from torch.utils.data import Dataset, DataLoader, random_split
import torch.optim as optim
from tqdm import tqdm
import numpy as np
from tqdm import trange
from medmnist import ChestMNIST
from matplotlib import pyplot as plt
from sklearn.metrics import hamming_loss, accuracy_score, precision_recall_fscore_support, average_precision_score
import os
from torchvision import transforms
import glob
import random
from collections import defaultdict
from torchvision.models import *
import torch.nn as nn


import torch
from torch.utils.data import Dataset, DataLoader


from torch.optim import AdamW
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import time
from tqdm import *

TARGET_SIZE = 384


def resize_and_center_crop(img, size):
    w, h = img.size
    scale = size / min(w, h)
    new_w, new_h = int(w * scale), int(h * scale)

    img = img.resize((new_w, new_h), Image.BILINEAR)

    left = (new_w - size) // 2
    top = (new_h - size) // 2
    right = left + size
    bottom = top + size

    return img.crop((left, top, right, bottom))

class AIMdel():
    image_classifier_locations = [
        'تخت_جمشید',
        'میدان_نقش_جهان',
        'کاخ_گلستان',
        'برج_میلاد',
        'بازار_بزرگ_اصفهان',
        'مسجد_جامع_اصفهان',
        'مسجد_شیخ_لطف\u200cالله',
        'سی\u200c_و_سه_پل',
        'پل_خواجو',
        'ارگ_بم',
        'باغ_شاهزاده_ماهان',
        'باغ_دولت\u200cآباد',
        'باغ_فتح\u200cآباد',
        'حرم_حضرت_معصومه',
        'بازار_تبریز',
        'کاخ_چهلستون',
        'عمارت_عالی\u200cقاپو',
        'آرامگاه_فردوسی',
        'آرامگاه_خیام_نیشابور',
        'گنبد_سلطانیه',
        'تخت_سلیمان',
        'طاق_بستان',
        'مجموعه_بیستون',
        'قره_کلیسا',
        'کلیسای_وانک',
        'آتشکده_زرتشتیان_یزد',
        'روستای_ماسوله',
        'روستای_صخره\u200cای_میمند',
        'قلعه_فلک\u200cالافلاک',
        'قلعه_الموت',
        'قلعه_رودخان',
        'غار_علی_صدر',
        'برج_گنبد_کاووس',
        'تالاب_انزلی',
        'کویر_لوت_شهداد',
        'جزیره_کیش',
        'ژئوپارک_قشم',
        'دره_ستارگان',
        'دره_تندیس\u200cها_قشم',
        'بازار_قیصریه',
        'آرامگاه_عطار_نیشابور',
        'آرامگاه_شیخ_صفی\u200cالدین_اردبیلی',
        'کاخ_سعدآباد',
        'کاخ_نیاوران',
        'بازار_رضای_مشهد',
        'مسجد_جامع_یزد',
        'منارجنبان',
        'مسجد_جمکران',
        'زیگورات_چغازنبیل',
        'شهر_سوخته_زابل',
        'محوطه_باستانی_شوش',
        'کاخ_آپادانا_شوش',
        'آرامگاه_باباطاهر_عریان',
        'آرامگاه_ابوعلی_سینا',
        'بام_تهران',
        'دربند',
        'توچال',
        'پارک_چیتگر',
        'پل_طبیعت',
        'کتیبه_بیستون',
        'سازه\u200cهای_آبی_شوشتر',
        'تالاب_میانکاله',
        'دریاچه_زریوار',
        'دریاچه_چیتگر',
        'آرامگاه_شمس_تبریزی',
        'آرامگاه_نادرشاه_افشار',
        'قلعه_دختر_ساوه',
        'بازار_سنتی_رشت',
        'بازار_سنتی_کرمانشاه',
        'بازار_سنتی_همدان',
        'مسجد_جامع_کرمان',
        'حمام_گنجعلی\u200cخان',
        'مجموعه_گنجعلی\u200cخان',
        'برج_میلاد',
        'جنگل_حرای_قشم',
        'روستای_لافت',
        'آبشار_شوی_دزفول',
        'دریاچه_نئور',
        'دریاچه_ولشت',
        'کلات_نادری',
        'تپه_هگمتانه',
        'غار_قوری_قلعه',
        'غار_کرفتو',
        'قلعه_بیرجند',
        'عمارت_کلاه\u200cفرنگی_بیرجند',
        'آسیاب_آبی_اشکذر',
        'یخچال_خشتی_میبد',
        'کاروانسرای_سعدالسلطنه',
        'باغ_اکبرآباد_بیرجند',
        'روستای_ماخونیک',
        'روستای_کندلوس',
        'روستای_فیلبند',
        'آبشار_کبودوال',
        'دهکده_گردشگری_گنجنامه',
        'طاق_گرا',
        'قنات_قصبه_گناباد',
        'قنات_زارچ',
        'مسجد_کبود',
        'عمارت_شهرداری_قزوین',
        'آتشکده_زرتشتیان_کرمان',
        'آتشکده_کرکویه',
        'بازار_بزرگ_کرمان',
        'پارک_ملی_گلستان',
        'جزیره_هنگام',
        'جزیره_لارک',
        'بندر_سیراف',
        'تنگه_شیرز',
        'کلوت_شهداد',
        'روستای_پاقلعه_بجنورد',
        'روستای_سر_آقا_سید',
        'قلعه_فلک\u200cالافلاک',
        'پل_شاپوری_خرم\u200cآباد',
        'آبشار_بیشه',
        'منطقه_اورامان',
        'سنگ_نبشته_اورامان',
        'روستای_هزاوه',
        'قبرستان_شیخان',
        'پارک_جنگلی_نهارخوران_گرگان',
        'کاخ_موزه_گرگان',
        'مسجد_جامع_سمنان',
        'عمارت_و_باغ_امیر_سمنان',
        'آرامگاه_شیخ_احمد_جامی_(تربت_جام)',
        'رباط_لاری_(تربت_حیدریه)',
        'بازار_قدیم_قم',
        'مدرسه_فیضیه_قم',
        'امامزاده_هاشم',
        'امام\u200cزاده_صالح',
        'بازار_سنندج',
        'حمام_شیشه_سنندج',
        'خانه_دکتر_مصدق',
        'باغ_ملی_تربت_حیدریه',
        'آرامگاه_کمال\u200cالملک_نیشابور',
        'بازار_ماهی\u200cفروشان_بندرعباس',
        'قلعه_والی',
        'معبد_هندوها',
        'پارک_جنگلی_سیسنگان',
    ]
    text_class_mapping = {
        "clean": 0,
        "spam": 1,
        "obscene": 2,
        "spamobscene": 3,
        "hate": 4,
        "hateobscene": 5
    }
    def initializeModel(self):
        self.device = (
        "cuda"
        if torch.cuda.is_available()
        else "mps"
        if torch.backends.mps.is_available()
        else "cpu"
        )
        self.initImageModel(self.device)
        self.initTextModel(self.device)

    def initImageModel(self ,device):
        self.image_num_classes = len(AIMdel.image_classifier_locations)
        self.image_model = convnext_base(weights="None")
        self.image_model.classifier[2] = nn.Linear(self.image_model.classifier[2].in_features, self.image_num_classes)
        self.image_model = self.image_model.to(device)
        # 1. Loss and optimizer
        self.image_criterion = nn.CrossEntropyLoss(label_smoothing=0.1)
        self.image_optimizer = optim.AdamW([
            {"params": self.image_model.features.parameters(), "lr": 5e-5},
            {"params": self.image_model.classifier.parameters(), "lr": 1e-3},
        ])
        self.val_transform = transforms.Compose([
            transforms.Resize((384, 384)),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406],
                                [0.229, 0.224, 0.225])
        ])
        self.image_model.load_state_dict(torch.load('convnext_iranian_landmarksTop136.pth'))

    def initTextModel(self ,device):
        self.text_model = AutoModelForSequenceClassification.from_pretrained(self.text_model_name, num_labels=6)
        self.text_optimizer = AdamW(self.text_model.parameters(), lr=2e-5)
        self.text_criterion = nn.CrossEntropyLoss()
        self.text_id2label = {
            0: "clean",
            1: "spam",
            2: "obscene",
            3: "spamobscene",
            4: "hate",
            5: "hateobscene"
        }
        self.text_model_name = "HooshvareLab/bert-base-parsbert-uncased"
        self.text_tokenizer = AutoTokenizer.from_pretrained(self.text_model_name)
        self.text_model.to(device)
        self.text_model.load_state_dict(torch.load('persian_comment_model.pth'))

    def predict_image(self, image_path):
        with torch.no_grad():
            # Load and transform image
            image = Image.open(image_path).convert('RGB')
            image_tensor = self.val_transform(image).unsqueeze(0).to(self.device)
            
            # Get prediction
            output = self.image_model(image_tensor)
            _, pred_idx = torch.max(output, 1)
            pred_class = self.image_classifier_locations[pred_idx.item()]
            confidence = torch.nn.functional.softmax(output, dim=1)[0][pred_idx].item()
            
            # Print result
            return {"predicted_class": pred_class, "confidence": confidence}   
        
    def predict_text(self, text):
            inputs = self.text_tokenizer(text, return_tensors="pt", truncation=True, padding='max_length', max_length=128).to(self.device)
            logits = self.text_model(**inputs)
            return self.text_id2label[F.softmax(logits['logits'], dim=-1), torch.argmax(logits['logits'], dim=1).item()]