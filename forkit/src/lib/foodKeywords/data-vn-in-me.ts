/* ForkIt — Vietnamese + Indian + Middle Eastern keywords */
import type { CategoryBlock } from './types'

export const VIETNAMESE_KEYWORDS: CategoryBlock = {
  category: 'vietnamese', type: 'dish', cuisineTag: 'Vietnamese',
  keywords: [
    'Pho','Pho Bo','Pho Ga','Beef Pho','Chicken Pho',
    'Banh Mi','Vietnamese Sandwich','Banh Mi Thit','Banh Mi Trung',
    'Bun Bo Hue','Bun Rieu','Bun Cha','Bun Thit Nuong','Bun Mam',
    'Com Tam','Broken Rice','Com Suon',
    'Banh Xeo','Sizzling Crepe','Banh Cuon','Banh Bot Loc',
    'Goi Cuon','Fresh Spring Roll','Cha Gio','Fried Spring Roll',
    'Cao Lau','Mi Quang','Hu Tieu','Vietnamese Noodle Soup',
    'Che','Vietnamese Sweet Soup','Banh Flan','Che Ba Mau','Che Chuoi',
    'Ca Phe Sua Da','Vietnamese Iced Coffee','Egg Coffee','Vietnamese Coffee','Nuoc Mia','Sugarcane Juice',
    'Lau','Vietnamese Hot Pot','Mut','Vietnamese Steamboat',
    'Vietnamese Restaurant','Quan Com','Quan Pho','Bun Bo Shop','Vietnamese Cafe',
  ],
}

export const INDIAN_KEYWORDS: CategoryBlock = {
  category: 'indian', type: 'dish', cuisineTag: 'Indian',
  keywords: [
    'Biryani','Chicken Biryani','Mutton Biryani','Veg Biryani','Hyderabadi Biryani','Nasi Briyani',
    'Curry','Butter Chicken','Tikka Masala','Rogan Josh','Dal Makhani','Palak Paneer','Paneer Tikka','Kadai Chicken','Chicken 65',
    'Roti','Naan','Prata','Paratha','Chapati','Puri','Kulcha','Garlic Naan','Butter Naan',
    'Idli','Dosa','Masala Dosa','Uttapam','Vada','Sambar','Rasam','Coconut Chutney',
    'Tandoori Chicken','Seekh Kebab','Shami Kebab','Malai Tikka','Murgh Tandoori',
    'Banana Leaf Rice','Thali','South Indian Thali','North Indian Thali',
    'Samosa','Pakora','Bhaji','Aloo Tikki','Briyani Rice','Plain Rice','Ghee Rice','Saffron Rice',
    'Gulab Jamun','Jalebi','Kheer','Halwa','Rasgulla','Kulfi','Payasam',
    'Lassi','Mango Lassi','Chai','Masala Chai','Teh Tarik India','Buttermilk','Chaas',
    'Mutton Curry','Fish Curry','Prawn Curry','Crab Masala','Egg Curry',
    'Pani Puri','Pav Bhaji','Bhel Puri','Chaat','Aloo Chat',
    'North Indian','South Indian','Mughlai','Punjabi','Rajasthani','Bengali','Goan','Kerala','Tamil','Hyderabadi',
    'Indian Restaurant','Indian Banana Leaf','Tandoor Restaurant','Dosa Shop','Vegetarian Indian',
  ],
}

export const MIDDLE_EASTERN_KEYWORDS: CategoryBlock = {
  category: 'middle_eastern', type: 'dish', cuisineTag: 'Middle Eastern',
  keywords: [
    'Shawarma','Chicken Shawarma','Beef Shawarma','Lamb Shawarma',
    'Kebab','Doner Kebab','Kofta Kebab','Shish Kebab','Seekh Kebab',
    'Hummus','Falafel','Pita','Pita Bread','Laffa','Wrap',
    'Mezze','Tabbouleh','Fattoush','Baba Ghanoush','Mutabbal',
    'Mansaf','Maqluba','Kabsa','Mandi','Shuwa','Saudi Rice','Ouzi',
    'Lamb Chops','Grilled Lamb','Whole Lamb Roast',
    'Turkish Pide','Lahmacun','Gozleme','Borek','Simit','Kofte',
    'Tagine','Couscous','Moroccan Stew','Harira',
    'Harees','Jareesh','Margooga',
    'Baklava','Kunafa','Halva','Turkish Delight','Lokum','Maamoul','Basbousa',
    'Arabic Coffee','Qahwa','Karak Tea','Mint Tea','Jallab','Ayran',
    'Persian Rice','Ghormeh Sabzi','Fesenjan','Joojeh Kabab','Chelo Kebab','Ash Reshteh','Zereshk Polo',
    'Lebanese','Turkish','Persian','Syrian','Jordanian','Egyptian','Moroccan','Emirati','Saudi','Yemeni','Iraqi',
    'Halal Steakhouse','Arabic Restaurant','Lebanese Restaurant','Turkish Restaurant','Persian Restaurant','Middle Eastern Cafe',
  ],
}
