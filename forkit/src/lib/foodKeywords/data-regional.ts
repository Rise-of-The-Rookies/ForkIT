/* ForkIt — SE Asian, East Asian, South Asian, African, Latin American keywords */
import type { CategoryBlock } from './types'

export const SOUTHEAST_ASIAN_KEYWORDS: CategoryBlock = {
  category: 'southeast_asian', type: 'dish', cuisineTag: 'Southeast Asian',
  keywords: [
    'Filipino Adobo','Sinigang','Kare-Kare','Lechon','Pancit','Lumpia','Halo-Halo','Sisig','Balut','Arroz Caldo',
    'Indonesian Nasi Padang','Gado-Gado','Soto Ayam','Bakso','Mie Goreng','Nasi Uduk','Tempeh','Rendang Indonesia','Sate Ayam','Opor Ayam','Pecel',
    'Singaporean Chilli Crab','Black Pepper Crab','Singapore Laksa','Kaya Toast','Hainanese Chicken Rice Singapore','Ice Kacang','Chendol Singapore',
    'Myanmar Mohinga','Shan Noodles','Tea Leaf Salad','Laphet Thoke',
    'Cambodian Amok','Khmer Curry','Nom Banh Chok','Bai Sach Chrouk',
    'Lao Larb','Laos Sticky Rice','Khao Niaw','Mok Pa',
    'Bruneian Ambuyat','Nasi Katok',
    'Southeast Asian','Indonesian Restaurant','Filipino Restaurant','Singaporean Restaurant',
  ],
}

export const EAST_ASIAN_KEYWORDS: CategoryBlock = {
  category: 'east_asian', type: 'dish', cuisineTag: 'East Asian',
  keywords: [
    'Hong Kong Style Cafe','Cha Chaan Teng','Milk Tea','French Toast HK','HK Noodle Soup','Pork Chop Bun',
    'Taiwanese Braised Pork Rice','Lu Rou Fan','Oyster Vermicelli','Oyster Omelette','Scallion Pancake Taiwan','Pineapple Cake','Bubble Tea Taiwan','Taro Ball','Aiyu Jelly','Shaved Milk Ice',
    'Cantonese Roast','Roast Goose','Char Siu Pork','Soya Chicken',
    'Mongolian Beef','Mongolian Grill','KBBQ','Hotpot','Mala Hotpot','Mala Xiang Guo','Mala Tang',
    'Dim Sum Brunch','Yam Cha','Chinese Tea House',
    'Cantonese Restaurant','Sichuan Restaurant','Shanghainese Restaurant','Taiwanese Restaurant','Hong Kong Cafe',
  ],
}

export const SOUTH_ASIAN_KEYWORDS: CategoryBlock = {
  category: 'south_asian', type: 'dish', cuisineTag: 'South Asian',
  keywords: [
    'Sri Lankan Rice & Curry','Kottu Roti','Hoppers','String Hoppers','Lamprais','Pol Sambola','Fish Ambul Thiyal','Dhal','Kiribath',
    'Pakistani Nihari','Haleem','Karahi','Chapli Kebab','Seekh Kebab Pakistan','Lahori Chargha','Paya','Saag','Daal Chawal',
    'Bangladeshi Hilsa Fish','Panta Bhat','Shorshe Ilish','Beef Tehari','Kacchi Biryani Bangladesh',
    'Nepali Dal Bhat','Momo','Thukpa','Sel Roti','Gundruk','Chatamari',
    'Afghan Bolani','Kabuli Pulao','Mantu','Qorma','Afghan Naan',
    'Sri Lankan Restaurant','Pakistani Restaurant','Nepali Restaurant','Afghan Restaurant','South Asian Cafe',
  ],
}

export const AFRICAN_KEYWORDS: CategoryBlock = {
  category: 'african', type: 'dish', cuisineTag: 'African',
  keywords: [
    'Jollof Rice','Nigerian Jollof','Ghanaian Jollof','Senegalese Thieboudienne',
    'Egusi Soup','Ogbono Soup','Efo Riro','Edikaikong','Afang Soup','Oha Soup',
    'Suya','Kilishi','Pomo','Ukpo','Akara','Moi Moi','Puff Puff','Chin Chin',
    'Ethiopian Injera','Doro Wat','Tibs','Misir Wot','Ethiopian Coffee Ceremony','Tej','Kitfo','Beyaynetu',
    'Nyama Choma','Ugali','Githeri','Mutura','Sukuma Wiki','Irio','Chapati Kenya','Mandazi',
    'South African Braai','Boerewors','Bunny Chow','Biltong','Bobotie','Potjie','Malva Pudding','Melktert',
    'North African Couscous','Tagine Morocco','Shakshuka North African','Msemen','Bastilla',
    'Egyptian Koshari','Ful Medames',"Ta'ameya",'Hawawshi','Mahshi',
    'West African','East African','North African','South African',
    'Ethiopian Restaurant','Nigerian Restaurant','African Braai','African Grill',
  ],
}

export const LATIN_AMERICAN_KEYWORDS: CategoryBlock = {
  category: 'latin_american', type: 'dish', cuisineTag: 'Latin American',
  keywords: [
    'Taco','Street Taco','Fish Taco','Al Pastor','Carne Asada','Barbacoa','Carnitas','Birria Taco',
    'Burrito','Wet Burrito','California Burrito','Quesadilla','Sincronizada','Gordita','Sope','Tlayuda',
    'Torta','Torta Ahogada','Guacamole','Salsa','Pico de Gallo','Nachos','Chips & Dip',
    'Tamale','Posole','Menudo','Sopa de Lima',
    'Ceviche','Peruvian Ceviche','Tiradito','Causa','Lomo Saltado','Aji de Gallina','Anticuchos',
    'Empanada','Chimichurri','Argentine Steak','Asado','Choripan',
    'Brazilian Churrasco','Pão de Queijo','Açaí Bowl','Feijoada','Brigadeiro',
    'Colombian Bandeja Paisa','Arepas','Sancocho',
    'Jerk Chicken','Curry Goat','Ackee & Saltfish','Plantain','Roti Caribbean','Doubles',
    'Cuban Sandwich','Ropa Vieja','Mofongo','Pernil',
    'Mexican Restaurant','Taqueria','Tex-Mex Restaurant','Latin American Restaurant','Brazilian Steakhouse','Churrascaria','Caribbean Restaurant','Peruvian Restaurant',
  ],
}
