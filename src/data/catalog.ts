// Static domain catalog: specialties, medications (with interaction/allergy tags),
// chief complaints, chronic conditions, health tips and seed name pools.

export interface Specialty {
  id: string
  name: string
  description: string
}

export const SPECIALTIES: Specialty[] = [
  { id: 'general', name: 'طب عمومی', description: 'بررسی‌های عمومی و ارجاع به متخصص' },
  { id: 'internal', name: 'داخلی', description: 'بیماری‌های داخلی و کلیه اعضای بدن' },
  { id: 'cardiology', name: 'قلب و عروق', description: 'بیماری‌های قلب، عروق و فشار خون' },
  { id: 'neurology', name: 'مغز و اعصاب', description: 'بیماری‌های مغز، اعصاب و ستون فقرات' },
  { id: 'orthopedics', name: 'ارتوپدی', description: 'استخوان، مفاصل و آسیب‌های ورزشی' },
  { id: 'dermatology', name: 'پوست و مو', description: 'بیماری‌های پوست، مو و ناخن' },
  { id: 'psychiatry', name: 'روان‌پزشکی', description: 'اضطراب، افسردگی و سلامت روان' },
  { id: 'pediatrics', name: 'کودکان', description: 'سلامت نوزادان و کودکان' },
  { id: 'gynecology', name: 'زنان و زایمان', description: 'سلامت بانوان، بارداری و زایمان' },
  { id: 'ent', name: 'گوش، حلق و بینی', description: 'بیماری‌های گوش، گلو و بینی' },
  { id: 'ophthalmology', name: 'چشم‌پزشکی', description: 'بیماری‌های چشم و بینایی' },
  { id: 'dentistry', name: 'دندان‌پزشکی', description: 'درد دندان و سلامت دهان' },
  { id: 'nutrition', name: 'تغذیه', description: 'رژیم غذایی و کنترل وزن' },
  { id: 'endocrinology', name: 'غدد و متابولیسم', description: 'دیابت، تیروئید و چاقی' },
  { id: 'urology', name: 'اورولوژی', description: 'بیماری‌های کلیه و مجاری ادرار' },
  { id: 'pulmonology', name: 'ریه', description: 'آسم، تنگی نفس و بیماری‌های ریوی' }
]

export function specialtyName(id: string): string {
  return SPECIALTIES.find((s) => s.id === id)?.name ?? id
}

export interface Drug {
  id: string
  name: string
  generic: string
  form: 'قرص' | 'کپسول' | 'شربت' | 'اسپری' | 'قطره' | 'کرم' | 'آمپول' | 'پماد'
  strength: string
  price: number // toman
  otc: boolean
  /** allergy classes used for cross-checking patient allergies */
  tags: string[]
  /** interacting drug ids */
  interactions: string[]
}

export const DRUGS: Drug[] = [
  { id: 'd01', name: 'استامینوفن', generic: 'Acetaminophen', form: 'قرص', strength: '۵۰۰ میلی‌گرم', price: 5000, otc: true, tags: ['analgesic'], interactions: ['d31'] },
  { id: 'd02', name: 'ایبوپروفن', generic: 'Ibuprofen', form: 'قرص', strength: '۴۰۰ میلی‌گرم', price: 12000, otc: true, tags: ['nsaid'], interactions: ['d23', 'd24', 'd28'] },
  { id: 'd03', name: 'ناپروکسن', generic: 'Naproxen', form: 'قرص', strength: '۲۵۰ میلی‌گرم', price: 18000, otc: true, tags: ['nsaid'], interactions: ['d23', 'd28'] },
  { id: 'd04', name: 'دیکلوفناک', generic: 'Diclofenac', form: 'آمپول', strength: '۷۵ میلی‌گرم', price: 22000, otc: false, tags: ['nsaid'], interactions: ['d23', 'd28'] },
  { id: 'd05', name: 'آسپرین', generic: 'Aspirin', form: 'قرص', strength: '۸۰ میلی‌گرم', price: 6000, otc: true, tags: ['nsaid', 'antiplatelet'], interactions: ['d23', 'd28', 'd25'] },
  { id: 'd06', name: 'آموکسی‌سیلین', generic: 'Amoxicillin', form: 'کپسول', strength: '۵۰۰ میلی‌گرم', price: 35000, otc: false, tags: ['penicillin', 'antibiotic'], interactions: ['d28'] },
  { id: 'd07', name: 'آزیترومایسین', generic: 'Azithromycin', form: 'قرص', strength: '۲۵۰ میلی‌گرم', price: 48000, otc: false, tags: ['antibiotic'], interactions: [] },
  { id: 'd08', name: 'سفالکسین', generic: 'Cephalexin', form: 'کپسول', strength: '۵۰۰ میلی‌گرم', price: 42000, otc: false, tags: ['antibiotic'], interactions: [] },
  { id: 'd09', name: 'سیپروفلوکساسین', generic: 'Ciprofloxacin', form: 'قرص', strength: '۵۰۰ میلی‌گرم', price: 39000, otc: false, tags: ['antibiotic'], interactions: ['d23'] },
  { id: 'd10', name: 'متفورمین', generic: 'Metformin', form: 'قرص', strength: '۵۰۰ میلی‌گرم', price: 15000, otc: false, tags: ['antidiabetic'], interactions: [] },
  { id: 'd11', name: 'گلیبنکلامید', generic: 'Glibenclamide', form: 'قرص', strength: '۵ میلی‌گرم', price: 12000, otc: false, tags: ['antidiabetic'], interactions: [] },
  { id: 'd12', name: 'انسولین گلارژین', generic: 'Insulin Glargine', form: 'آمپول', strength: '۱۰۰ واحد/میلی‌لیتر', price: 480000, otc: false, tags: ['antidiabetic'], interactions: [] },
  { id: 'd13', name: 'آتورواستاتین', generic: 'Atorvastatin', form: 'قرص', strength: '۲۰ میلی‌گرم', price: 28000, otc: false, tags: ['statin'], interactions: [] },
  { id: 'd14', name: 'رزوواستاتین', generic: 'Rosuvastatin', form: 'قرص', strength: '۱۰ میلی‌گرم', price: 34000, otc: false, tags: ['statin'], interactions: [] },
  { id: 'd15', name: 'لوزارتان', generic: 'Losartan', form: 'قرص', strength: '۵۰ میلی‌گرم', price: 26000, otc: false, tags: ['antihypertensive'], interactions: [] },
  { id: 'd16', name: 'آملودیپین', generic: 'Amlodipine', form: 'قرص', strength: '۵ میلی‌گرم', price: 14000, otc: false, tags: ['antihypertensive'], interactions: [] },
  { id: 'd17', name: 'هیدروکلروتیازید', generic: 'Hydrochlorothiazide', form: 'قرص', strength: '۲۵ میلی‌گرم', price: 9000, otc: false, tags: ['antihypertensive', 'sulfa'], interactions: [] },
  { id: 'd18', name: 'کاپتوپریل', generic: 'Captopril', form: 'قرص', strength: '۲۵ میلی‌گرم', price: 11000, otc: false, tags: ['antihypertensive'], interactions: [] },
  { id: 'd19', name: 'متوپرولول', generic: 'Metoprolol', form: 'قرص', strength: '۵۰ میلی‌گرم', price: 16000, otc: false, tags: ['betablocker'], interactions: [] },
  { id: 'd20', name: 'نیتروگلیسیرین زیرزبانی', generic: 'Nitroglycerin SL', form: 'قرص', strength: '۰/۵ میلی‌گرم', price: 25000, otc: false, tags: ['nitrate'], interactions: ['d29'] },
  { id: 'd21', name: 'اومپرازول', generic: 'Omeprazole', form: 'کپسول', strength: '۲۰ میلی‌گرم', price: 21000, otc: true, tags: ['ppi'], interactions: ['d28'] },
  { id: 'd22', name: 'فاموتیدین', generic: 'Famotidine', form: 'قرص', strength: '۲۰ میلی‌گرم', price: 13000, otc: true, tags: ['h2blocker'], interactions: [] },
  { id: 'd23', name: 'وارفارین', generic: 'Warfarin', form: 'قرص', strength: '۵ میلی‌گرم', price: 17000, otc: false, tags: ['anticoagulant'], interactions: ['d02', 'd03', 'd04', 'd05', 'd09', 'd32', 'd33'] },
  { id: 'd24', name: 'کلروپیدوگرل', generic: 'Clopidogrel', form: 'قرص', strength: '۷۵ میلی‌گرم', price: 45000, otc: false, tags: ['antiplatelet'], interactions: ['d21', 'd02'] },
  { id: 'd25', name: 'لیووتیروکسین', generic: 'Levothyroxine', form: 'قرص', strength: '۱۰۰ میکروگرم', price: 19000, otc: false, tags: ['thyroid'], interactions: ['d05'] },
  { id: 'd26', name: 'متیمازول', generic: 'Methimazole', form: 'قرص', strength: '۵ میلی‌گرم', price: 15000, otc: false, tags: ['thyroid'], interactions: [] },
  { id: 'd27', name: 'آلوپورینول', generic: 'Allopurinol', form: 'قرص', strength: '۱۰۰ میلی‌گرم', price: 13000, otc: false, tags: [], interactions: ['d23'] },
  { id: 'd28', name: 'پردنیزولون', generic: 'Prednisolone', form: 'قرص', strength: '۵ میلی‌گرم', price: 8000, otc: false, tags: ['corticosteroid'], interactions: ['d02', 'd06', 'd23', 'd21', 'd24'] },
  { id: 'd29', name: 'سالدبوتامول اسپری', generic: 'Salbutamol Inhaler', form: 'اسپری', strength: '۱۰۰ میکروگرم/پاف', price: 95000, otc: false, tags: ['bronchodilator'], interactions: ['d20'] },
  { id: 'd30', name: 'بودزوناید اسپری', generic: 'Budesonide Inhaler', form: 'اسپری', strength: '۲۰۰ میکروگرم/پاف', price: 180000, otc: false, tags: ['corticosteroid'], interactions: [] },
  { id: 'd31', name: 'ستیریزین', generic: 'Cetirizine', form: 'قرص', strength: '۱۰ میلی‌گرم', price: 10000, otc: true, tags: ['antihistamine'], interactions: ['d01'] },
  { id: 'd32', name: 'لوراتادین', generic: 'Loratadine', form: 'قرص', strength: '۱۰ میلی‌گرم', price: 11000, otc: true, tags: ['antihistamine'], interactions: ['d23'] },
  { id: 'd33', name: 'فلوکستین', generic: 'Fluoxetine', form: 'کپسول', strength: '۲۰ میلی‌گرم', price: 24000, otc: false, tags: ['ssri'], interactions: ['d23', 'd29'] },
  { id: 'd34', name: 'سرترالین', generic: 'Sertraline', form: 'قرص', strength: '۵۰ میلی‌گرم', price: 27000, otc: false, tags: ['ssri'], interactions: ['d23'] },
  { id: 'd35', name: 'زولپیدم', generic: 'Zolpidem', form: 'قرص', strength: '۱۰ میلی‌گرم', price: 22000, otc: false, tags: ['hypnotic'], interactions: ['d36'] },
  { id: 'd36', name: 'دیازپام', generic: 'Diazepam', form: 'قرص', strength: '۵ میلی‌گرم', price: 9000, otc: false, tags: ['benzodiazepine'], interactions: ['d35'] },
  { id: 'd37', name: 'فروس سولفات', generic: 'Ferrous Sulfate', form: 'قرص', strength: '۳۲۵ میلی‌گرم', price: 7000, otc: true, tags: ['iron'], interactions: [] },
  { id: 'd38', name: 'کلسیم + ویتامین D3', generic: 'Calcium + Cholecalciferol', form: 'قرص', strength: '۵۰۰+۲۰۰', price: 16000, otc: true, tags: ['supplement'], interactions: [] },
  { id: 'd39', name: 'مولتی‌ویتامین', generic: 'Multivitamin', form: 'قرص', strength: '—', price: 32000, otc: true, tags: ['supplement'], interactions: [] },
  { id: 'd40', name: 'کلوتریمازول کرم', generic: 'Clotrimazole Cream', form: 'کرم', strength: '۱٪', price: 18000, otc: true, tags: ['antifungal'], interactions: [] },
  { id: 'd41', name: 'میکونازول ژل', generic: 'Miconazole Gel', form: 'کرم', strength: '۲٪', price: 21000, otc: true, tags: ['antifungal'], interactions: [] },
  { id: 'd42', name: 'فلوکونازول', generic: 'Fluconazole', form: 'کپسول', strength: '۱۵۰ میلی‌گرم', price: 26000, otc: false, tags: ['antifungal'], interactions: [] },
  { id: 'd43', name: 'مترونیدازول', generic: 'Metronidazole', form: 'قرص', strength: '۲۵۰ میلی‌گرم', price: 14000, otc: false, tags: ['antibiotic'], interactions: [] },
  { id: 'd44', name: 'گوایافنزین شربت', generic: 'Guaifenesin Syrup', form: 'شربت', strength: '۱۰۰ میلی‌گرم/۵ میلی‌لیتر', price: 28000, otc: true, tags: ['expectorant'], interactions: [] }
]

export function drugById(id: string): Drug | undefined {
  return DRUGS.find((d) => d.id === id)
}

/** Common allergy substances shown in the wizard. */
export const COMMON_ALLERGENS = [
  'پنی‌سیلین',
  'سولفا (سولفونامیدها)',
  'آسپرین و NSAIDها',
  'ید',
  'فاتوماتِ گل، گرده گیاهان',
  'گرد و غبار',
  'بادام‌زمینی',
  'خرما',
  'تخم‌مرغ',
  'شیر گاو',
  'لاکتوز',
  'گلوتن'
]

export const CHIEF_COMPLAINTS = [
  'سردرد',
  'تب و لرز',
  'سرفه خشک',
  'گلودرد',
  'درد شکم',
  'اسهال',
  'یبوست',
  'سرگیجه',
  'درد قفسه سینه',
  'تپش قلب',
  'کمردرد',
  'درد زانو',
  'خارش پوست',
  'آکنه و جوش صورت',
  'ریزش مو',
  'اضطراب و استرس',
  'بی‌خوابی',
  'افت خلق و ذهن',
  'کنترل فشار خون',
  'کنترل قند خون',
  'تیروئید',
  'مشاوره تغذیه و کاهش وزن',
  'چک‌آپ دوره‌ای',
  'واکسیناسیون'
]

export const CHRONIC_CONDITIONS_POOL = [
  'دیابت نوع ۲',
  'فشار خون بالا',
  'هایپرتیروئید',
  'هایپوتیروئید',
  'آسم',
  'بیماری انسداد مزمن ریه (COPD)',
  'بیماری قلبی کرونری',
  'سابقه سکته قلبی',
  'سابقه سکته مغزی',
  'افسردگی',
  'اضطراب فراگیر',
  'صرع',
  'میگرن',
  'آرتریت روماتوئید',
  'لوپوس اریتماتوز',
  'بیماری کلیوی مزمن',
  'سنگ کلیه',
  'کبد چرب',
  'کم‌خونی فقر آهن',
  'آلرژی فصلی',
  'اگزما',
  'پسوریازیس',
  'سندرم تخمدان پلی‌کیستیک (PCOS)',
  'آندومتریوز',
  'پرخوری عصبی'
]

export const HEALTH_TIPS = [
  {
    icon: 'droplets',
    title: 'آب کافی بنوشید',
    body: 'روزانه ۶ تا ۸ لیوان آب بنوشید؛ کم‌آبی بدن باعث خستگی، سردرد و کاهش تمرکز می‌شود.'
  },
  {
    icon: 'moon',
    title: 'خواب منظم داشته باشید',
    body: '۷ تا ۹ ساعت خواب شبانه با ساعت ثابت، قلب و سیستم ایمنی بدن شما را تقویت می‌کند.'
  },
  {
    icon: 'footprints',
    title: 'روزانه ۳۰ دقیقه پیاده‌روی',
    body: 'پیاده‌روی سریع روزانه خطر دیابت نوع ۲ و بیماری قلبی را تا ۳۰٪ کاهش می‌دهد.'
  },
  {
    icon: 'salt',
    title: 'نمک را محدود کنید',
    body: 'مصرف نمک روزانه کمتر از ۵ گرم (یک قاشق چای‌خوری) است؛ فشار خون خود را کنترل کنید.'
  },
  {
    icon: 'candy',
    title: 'قند افزوده را کم کنید',
    body: 'نوشیدنی‌های شیرین مهم‌ترین منبع قند افزوده هستند؛ با آب یا چای کم‌قند جایگزین کنید.'
  },
  {
    icon: 'cigarette',
    title: 'ترک دخانیات',
    body: 'فقط ۲۴ ساعت پس از ترک سیگار، خطر حمله قلبی شروع به کاهش می‌کند.'
  },
  {
    icon: 'stethoscope',
    title: 'چک‌آپ سالانه',
    body: 'فشار خون، قند و چربی خون خود را سالانه بررسی کنید؛ پیشگیری ارزان‌تر از درمان است.'
  },
  {
    icon: 'brain',
    title: 'سلامت روان را جدی بگیرید',
    body: 'استرس مزمن بدن را در برابر بیماری‌ها آسیب‌پذیر می‌کند؛ تنفس عمیق و مدیتیشن را امتحان کنید.'
  }
]

// ---------- seed pools ----------

export const MALE_NAMES = [
  'امیرعلی', 'محمدحسین', 'علی', 'رضا', 'حسین', 'مهدی', 'امیرحسین', 'سینا', 'آرش', 'کیان',
  'محمد', 'بهراد', 'پویا', 'سامان', 'فرهاد', 'کامران', 'نیما', 'آرمین', 'سعید', 'وحید',
  'محسن', 'میلاد', 'هومن', 'یاسر', 'بهزاد', 'ارسلان', 'ایمان', 'پرهام', 'تیمور', 'ژاله‌الدین',
  'جلیل', 'حامد', 'داوود', 'رامین', 'زوبین', 'شهاب', 'طاها', 'عادل', 'فرزاد', 'کریم'
]

export const FEMALE_NAMES = [
  'زهرا', 'فاطمه', 'مریم', 'نرگس', 'سارا', 'الهام', 'نگار', 'پریسا', 'شیوا', 'رویا',
  'مینا', 'لیلا', 'هستی', 'آیدا', 'ترانه', 'سمیرا', 'بهاره', 'پگاه', 'تارا', 'ژاله',
  'غزاله', 'فرزانه', 'کیمیا', 'گلناز', 'مهدیه', 'نازنین', 'ویدا', 'هانیه', 'یاسمین', 'آوا',
  'دنیا', 'رها', 'سمانه', 'عاطفه', 'فرحناز', 'کوثر', 'مهدیس', 'نسرین', 'هلن', 'یلدا'
]

export const FAMILY_NAMES = [
  'محمدی', 'حسینی', 'رضایی', 'کریمی', 'موسوی', 'صادقی', 'جعفری', 'قاسمی', 'رحیمی', 'هاشمی',
  'اکبری', 'مرادی', 'بهرامی', 'اسماعیلی', 'زمانی', 'نیک‌پور', 'امینی', 'فرهمند', 'صالحی', 'طاهری',
  'کاظمی', 'نجفی', 'قربانی', 'شریفی', 'یزدانی', 'علوی', 'سلطانی', 'میرزایی', 'خسروی', 'پارسا',
  'توکلی', 'فتحی', 'بناکار', 'خدادادی', 'رستمی', 'سلیمانی', 'عزیزی', 'غفاری', 'لطیفی', 'مهدوی',
  'نوروزی', 'هاشمیان', 'یوسفی', 'آقایی', 'ابراهیمی', 'احمدی', 'افشار', 'پاکدل', 'تهرانی', 'جهانگیری',
  'حیدری', 'خاکپور', 'دلاور', 'رادمنش', 'شفیعی', 'صدیقی', 'عباسی', 'علی‌پور', 'فتح‌اللهی', 'کاشانی'
]

export const DOCTOR_EDUCATIONS = [
  'دانشگاه علوم پزشکی تهران',
  'دانشگاه علوم پزشکی شهید بهشتی',
  'دانشگاه علوم پزشکی ایران',
  'دانشگاه علوم پزشکی مشهد',
  'دانشگاه علوم پزشکی اصفهان',
  'دانشگاه علوم پزشکی شیراز',
  'دانشگاه علوم پزشکی تبریز',
  'دانشگاه علوم پزشکی یزد'
]

export const DOCTOR_BIOS = [
  'بیش از {n} سال سابقه درمان و مشاوره تخصصی با رویکرد بیمارمحور. عضو انجمن تخصصی مربوطه و مدرس دوره‌های آموزشی پزشکان.',
  'پزشک متخصص با تمرکز بر درمان‌های حداقل تهاجمی و پیگیری مستمر سلامت بیماران. پاسخگویی به سؤالات شما افتخار من است.',
  'فارغ‌التحصیل از دانشگاه‌های برتر کشور با {n} سال تجربه بالینی. معتقدم آموزش بیمار، نیمی از درمان است.',
  'فعال در حوزه پژوهش و درمان با {n} سال سابقه. رویکرد من بر اساس جدیدترین پروتکل‌های علمی روز دنیاست.',
  'علاوه بر درمان بیماری‌ها، بر پیشگیری و اصلاح سبک زندگی تأکید ویژه دارم. {n} سال است در این مسیر همراه بیمارانم هستم.'
]
