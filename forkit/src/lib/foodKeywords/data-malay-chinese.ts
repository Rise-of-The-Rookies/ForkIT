/* ForkIt — Malay & Malaysian + Chinese keywords */
import type { CategoryBlock } from './types'

export const MALAY_KEYWORDS: CategoryBlock = {
  category: 'malay', type: 'dish', cuisineTag: 'Malaysian',
  keywords: [
    'Nasi Lemak','Nasi Goreng','Nasi Kandar','Nasi Dagang','Nasi Kerabu','Nasi Ulam','Nasi Minyak','Nasi Beriani','Nasi Ambeng',
    'Mee Goreng','Mee Rebus','Mee Kolok','Mee Jawa',
    'Laksa','Asam Laksa','Curry Laksa','Sarawak Laksa','Penang Laksa',
    'Char Kway Teow','Kway Teow Goreng','Bee Hoon Goreng',
    'Rendang','Rendang Tok','Rendang Ayam','Rendang Daging',
    'Satay','Satay Kajang','Satay Celup',
    'Rojak','Pasembur','Kerabu','Ulam',
    'Roti Canai','Roti Tissue','Roti Bakar','Roti Jala','Roti John',
    'Popiah','Popiah Goreng','Curry Puff','Epok-epok','Karipap',
    'Kuih','Kuih Lapis','Onde-onde','Putu Piring','Putu Bambu','Angku Kuih','Seri Muka','Kuih Talam','Kuih Dadar','Bahulu',
    'Ais Kacang','Cendol','Cendol Gula Melaka','Air Mata Kucing','Sirap Bandung',
    'Teh Tarik','Teh O','Kopi O',
    'Sup Tulang','Sup Kambing','Sup Torpedo','Bak Kut Teh',
    'Ikan Bakar','Ayam Percik','Ayam Goreng Berempah','Ayam Bakar','Ayam Masak Merah',
    'Patin Tempoyak','Gulai Tempoyak','Masak Lemak Cili Api','Asam Pedas','Gulai','Kari Kepala Ikan',
    'Otak-otak','Lemang','Ketupat','Ketupat Nasi','Nasi Impit',
    'Char Siu','Wonton','Chee Cheong Fun','Hakka Mee','Pan Mee','Curry Mee','Hokkien Mee','Prawn Mee',
    'Economy Rice','Mixed Rice','Claypot Rice','Pork Chop Rice','Banana Leaf Rice',
    'Tosai','Idli','Vada','Chapati',
  ],
}

export const MALAY_VENUE_KEYWORDS: CategoryBlock = {
  category: 'malay', type: 'venue', cuisineTag: 'Malaysian',
  keywords: ['Mamak','Warung','Gerai','Kopitiam','Hawker','Restoran','Kedai Makan'],
}

export const CHINESE_KEYWORDS: CategoryBlock = {
  category: 'chinese', type: 'dish', cuisineTag: 'Chinese',
  keywords: [
    'Dim Sum','Yum Cha','Har Gow','Siu Mai','Char Siu Bao','Liu Sha Bao','Egg Tart','Chee Cheong Fun','Lo Mai Gai','Turnip Cake','Taro Dumpling','Rice Noodle Roll','Spring Roll','Wu Gok',
    'Peking Duck','Karaage','Roast Pork','Soy Sauce Chicken','Wonton Noodle','Duck Noodle','Roast Duck','Char Siu','Crispy Pork Belly',
    'Hot Pot','Steamboat','Malatang','Chongqing Hot Pot','Cantonese Steamboat',
    'Kung Pao Chicken','Mapo Tofu','Sweet & Sour Pork','Black Pepper Beef','Oyster Sauce Beef','Steamed Fish','Garlic Prawns','Salted Egg Prawn','Butter Prawn','Claypot Tofu',
    'Fried Rice','Yangzhou Fried Rice','Hokkien Fried Rice','Chicken Rice','Hainanese Chicken Rice','Roast Chicken Rice',
    'Wonton Soup','Hot & Sour Soup','Corn Soup','Double Boiled Soup','Herbal Soup',
    'Congee','Porridge','Minced Pork Congee','Century Egg Congee','Fish Congee',
    'Noodles','Wonton Noodle','Beef Ho Fun','Dry Noodles','Cold Noodle','Glass Noodles','Rice Noodles',
    'Cantonese','Teochew','Hakka','Hokkien','Shanghainese','Szechuan','Hunanese','Fujian','Hainanese','Chaozhou',
    'Taiwanese Beef Noodle','Braised Pork Rice','Oyster Vermicelli','Three Cup Chicken','Scallion Pancake','Stinky Tofu','Gua Bao','Iron Egg',
    'Tanghulu','Egg Puff','Bubble Waffle','Sesame Ball','Mooncake','Nian Gao','Tang Yuan','Jian Dui',
    'Boba','Bubble Tea','Pearl Milk Tea','Brown Sugar Milk','Cheese Tea','Taro Milk Tea','Matcha Latte',
    'Chinese BBQ','Hong Kong Style','Cantonese Cuisine','Beijing Cuisine','Sichuan Cuisine',
  ],
}
