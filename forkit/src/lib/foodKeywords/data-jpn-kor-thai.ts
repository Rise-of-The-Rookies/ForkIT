/* ForkIt — Japanese + Korean + Thai keywords */
import type { CategoryBlock } from './types'

export const JAPANESE_KEYWORDS: CategoryBlock = {
  category: 'japanese', type: 'dish', cuisineTag: 'Japanese',
  keywords: [
    'Sushi','Nigiri','Maki','Temaki','Omakase','Chirashi','Kaiten Sushi','Sashimi','Sushi Bento',
    'Ramen','Tonkotsu Ramen','Shoyu Ramen','Miso Ramen','Tsukemen','Mazemen','Tantanmen','Spicy Ramen',
    'Udon','Tempura Udon','Kake Udon','Zaru Udon','Curry Udon',
    'Soba','Zarusoba','Hot Soba',
    'Tempura','Tonkatsu','Katsudon','Oyakodon','Gyudon','Tendon','Unadon','Kaisendon',
    'Gyoza','Takoyaki','Okonomiyaki','Monjayaki',
    'Yakitori','Kushiyaki','Kushi Katsu',
    'Shabu Shabu','Sukiyaki','Yakiniku','Japanese BBQ','Teppanyaki','Robatayaki',
    'Curry Rice','Japanese Curry','Katsu Curry',
    'Bento','Convenience Bento','Teishoku',
    'Miso Soup','Tofu','Edamame','Karaage','Teriyaki','Tsukemono','Onigiri','Onigirazu',
    'Wagashi','Mochi','Daifuku','Dorayaki','Taiyaki','Anmitsu','Parfait','Japanese Cheesecake','Crepe','Matcha Dessert','Kakigori','Soft Cream',
    'Izakaya','Omakase Restaurant','Kaiseki','Shokudo','Ramen Shop','Soba Restaurant','Sushi Bar','Yakiniku Restaurant',
  ],
}

export const KOREAN_KEYWORDS: CategoryBlock = {
  category: 'korean', type: 'dish', cuisineTag: 'Korean',
  keywords: [
    'Korean BBQ','Samgyeopsal','Bulgogi','Galbi','Chadolbaegi','Brisket','Dak Galbi','Pork Belly','Beef Tongue',
    'Bibimbap','Dolsot Bibimbap','Jeonju Bibimbap',
    'Tteokbokki','Rabokki','Seafood Tteokbokki',
    'Jajangmyeon','Jjamppong','Ramyeon',
    'Army Stew','Budae Jjigae',
    'Korean Fried Chicken','Huraideu Chikin','Honey Butter Chicken','Garlic Soy Chicken',
    'Kimchi','Kimchi Jjigae','Kimchi Fried Rice','Doenjang Jjigae','Sundubu Jjigae',
    'Samgyetang','Galbijjim','Japchae',
    'Pajeon','Haemul Pajeon','Kimchi Pancake','Bindaetteok',
    'Kimbap','Gimbap','Korean Sushi Roll',
    'Naengmyeon','Mul Naengmyeon','Bibim Naengmyeon',
    'Sundubu','Gyeran Jjim','Doenjang','Ganjang Gejang',
    'Bingsu','Patbingsu','Korean Shaved Ice','Hotteok','Bungeoppang','Eomuk','Dalgona','Korean Corn Dog','Korean Toast',
    'Korean Cafe','Korean Street Food','Korean Barbecue Restaurant','Pocha','Pojangmacha',
  ],
}

export const THAI_KEYWORDS: CategoryBlock = {
  category: 'thai', type: 'dish', cuisineTag: 'Thai',
  keywords: [
    'Pad Thai','Pad See Ew','Pad Krapow','Pad Cashew','Pad Prik','Pad Woon Sen',
    'Tom Yum','Tom Kha Gai','Tom Yum Kung','Tom Yum Seafood',
    'Green Curry','Red Curry','Yellow Curry','Massaman Curry','Panang Curry','Thai Curry',
    'Khao Man Gai','Khao Pad','Khao Na Pet','Khao Moo Daeng',
    'Som Tum','Papaya Salad','Larb','Yam','Thai Salad',
    'Mango Sticky Rice','Tub Tim Grob','Khanom Krok','Lod Chong','Bua Loi',
    'Satay','Skewers','Thai Skewers',
    'Khao Soi','Northern Thai Curry Noodle','Basil Fried Rice','Pineapple Fried Rice','Pad Kra Pao','Thai Basil','Thai Chilli',
    'Thai Milk Tea','Thai Iced Tea','Cha Yen','Nam Manao',
    'Thai Barbecue','Mookata','Thai BBQ Buffet','Thai Street Food','Thai Restaurant','Thai Cafe',
  ],
}
