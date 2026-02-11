const shuffle = (array: string[]) => array.sort(() => Math.random() - 0.5);

const rawImages = [
  '/team11/images/baz1.jpg', '/team11/images/baz2.jpg', '/team11/images/baz3.jpg', '/team11/images/baz4.jpg', '/team11/images/baz5.jpg',
  '/team11/images/his1.jpg', '/team11/images/his2.jpg', '/team11/images/his3.jpg', '/team11/images/his4.jpg', '/team11/images/his5.jpg',
  '/team11/images/his6.jpg', '/team11/images/his7.jpg', '/team11/images/his8.jpg', '/team11/images/his9.jpg', '/team11/images/his10.jpg',
  '/team11/images/his11.jpg', '/team11/images/his12.jpg', '/team11/images/his13.jpg', '/team11/images/his14.jpg',
  '/team11/images/maz1.jpg', '/team11/images/maz2.jpg', '/team11/images/maz3.jpg',
  '/team11/images/nat1.jpg', '/team11/images/nat2.jpg', '/team11/images/nat3.jpg', '/team11/images/nat4.jpg', '/team11/images/nat5.jpg',
  '/team11/images/nat6.jpg', '/team11/images/nat7.jpg', '/team11/images/nat9.jpg', '/team11/images/nat10.jpg',
  '/team11/images/rod1.jpg', '/team11/images/rod2.jpg', '/team11/images/rod3.jpg', '/team11/images/rod4.jpg', '/team11/images/rod5.jpg',
  '/team11/images/sea1.jpg', '/team11/images/sea2.jpg', '/team11/images/sea3.jpg', '/team11/images/sea4.jpg'
];
export const SCROLLING_IMAGES = shuffle([...rawImages]);

export const PROVINCES_DETAILS: Record<string, { province: string; name: string; image: string }> = {
  alborz: { province: 'alborz', name: 'البرز', image: 'https://cdn.mashreghnews.ir/d/2020/05/11/4/2793271.jpg' },
  ardabil: { province: 'ardabil', name: 'اردبیل', image: 'https://ammi.ir/wp-content/uploads/1__2_-Medium-16.jpg' },
  azarbaijan_east: { province: 'azarbaijan_east', name: 'آذربایجان شرقی', image: 'https://sepanja.com/blog/wp-content/uploads/2021/08/Shah-goli.jpg' },
  azarbaijan_west: { province: 'azarbaijan_west', name: 'آذربایجان غربی', image: 'https://ammi.ir/wp-content/uploads/26__2_-Medium.jpg' },
  bushehr: { province: 'bushehr', name: 'بوشهر', image: 'https://ammi.ir/wp-content/uploads/1__20_-39.jpg' },
  chaharmahal_bakhtiari: { province: 'chaharmahal_bakhtiari', name: 'چهارمحال و بختیاری', image: 'https://ammi.ir/wp-content/uploads/1__5_-208.jpg' },
  fars: { province: 'fars', name: 'فارس', image: 'https://ammi.ir/wp-content/uploads/1__3__2-Medium-23.jpg' },
  gilan: { province: 'gilan', name: 'گیلان', image: 'https://ammi.ir/wp-content/uploads/1__10__2-Medium-34.jpg' },
  golestan: { province: 'golestan', name: 'گلستان', image: 'https://ammi.ir/wp-content/uploads/1__10__2-67.jpg' },
  hamadan: { province: 'hamadan', name: 'همدان', image: 'https://cdn.alibaba.ir/ostorage/alibaba-mag/wp-content/uploads/2020/03/0-850%C3%97440-Alisadr-Cave.jpg' },
  hormozgan: { province: 'hormozgan', name: 'هرمزگان', image: 'https://ammi.ir/wp-content/uploads/1-__13_-22.jpg' },
  ilam: { province: 'ilam', name: 'ایلام', image: 'https://img9.irna.ir/d/r1/2023/05/16/4/170372442.jpg?ts=1684255549890' },
  isfahan: { province: 'isfahan', name: 'اصفهان', image: 'https://ammi.ir/wp-content/uploads/1__5__result-24.jpg' },
  kerman: { province: 'kerman', name: 'کرمان', image: 'https://www.mizan.news/wp-content/uploads/2022/01/1542508_141.jpg' },
  kermanshah: { province: 'kermanshah', name: 'کرمانشاه', image: 'https://ammi.ir/wp-content/uploads/1__11_-127.jpg' },
  khorasan_north: { province: 'khorasan_north', name: 'خراسان شمالی', image: 'https://ammi.ir/wp-content/uploads/1__20_-97.jpg' },
  khorasan_razavi: { province: 'khorasan_razavi', name: 'خراسان رضوی', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcScvJghkXJNuFJFHZ13DMYA0PwyDOGEQTzFSQ&s' },
  khorasan_south: { province: 'khorasan_south', name: 'خراسان جنوبی', image: 'https://ammi.ir/wp-content/uploads/1__9_-242.jpg' },
  khuzestan: { province: 'khuzestan', name: 'خوزستان', image: 'https://ammi.ir/wp-content/uploads/1__25_-25.jpg' },
  kohgiluyeh_boyer_ahmad: { province: 'kohgiluyeh_boyer_ahmad', name: 'کهگیلویه و بویراحمد', image: 'https://ammi.ir/wp-content/uploads/4-2.jpg' },
  kurdistan: { province: 'kurdistan', name: 'کردستان', image: 'https://ammi.ir/wp-content/uploads/1__5_-121.jpg' },
  lorestan: { province: 'lorestan', name: 'لرستان', image: 'https://ammi.ir/wp-content/uploads/1__15_-Medium-33.jpg' },
  markazi: { province: 'markazi', name: 'مرکزی', image: 'https://ammi.ir/wp-content/uploads/1__2__result_2-13.jpg' },
  mazandaran: { province: 'mazandaran', name: 'مازندران', image: 'https://ammi.ir/wp-content/uploads/1-__14_-18.jpg' },
  qazvin: { province: 'qazvin', name: 'قزوین', image: 'https://ammi.ir/wp-content/uploads/1-__6_-40.jpg' },
  qom: { province: 'qom', name: 'قم', image: 'https://ammi.ir/wp-content/uploads/1__11_-92.jpg' },
  semnan: { province: 'semnan', name: 'سمنان', image: 'https://ammi.ir/wp-content/uploads/1__3__2-92.jpg' },
  sistan_baluchestan: { province: 'sistan_baluchestan', name: 'سیستان و بلوچستان', image: 'https://ammi.ir/wp-content/uploads/1__13_-200.jpg' },
  tehran: { province: 'tehran', name: 'تهران', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqYX0HTGKPhd4cvPavmQ6_yW14uReWkvJkog&s' },
  yazd: { province: 'yazd', name: 'یزد', image: 'https://ammi.ir/wp-content/uploads/1__15__result-40.jpg' },
  zanjan: { province: 'zanjan', name: 'زنجان', image: 'https://ammi.ir/wp-content/uploads/1-__22_-4.jpg' },
};
