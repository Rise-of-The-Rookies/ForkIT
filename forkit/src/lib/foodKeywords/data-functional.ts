/* ForkIt — Formats, Desserts, Drinks, Venues, Occasions, Price keywords */
import type { CategoryBlock } from './types'

export const FORMAT_KEYWORDS: CategoryBlock = {
  category: 'format', type: 'format',
  keywords: [
    'Rice','Fried Rice','Steamed Rice','Coconut Rice','Claypot Rice','Biryani Rice','Brown Rice','White Rice','Mixed Grain',
    'Noodles','Fried Noodles','Soup Noodles','Dry Noodles','Cold Noodles','Glass Noodles','Rice Noodles','Wheat Noodles','Egg Noodles','Ramen','Udon','Soba','Vermicelli','Bee Hoon','Kway Teow','Wonton Noodle','Instant Noodle',
    'Bread','Sandwich','Wrap','Flatbread','Pita','Toast','Bun','Roll',
    'Soup','Broth','Stew','Curry','Gravy','Sauce-Based',
    'Grill','BBQ','Charcoal Grill','Charbroiled','Flame Grilled','Tandoor','Rotisserie','Smoked',
    'Fried','Deep Fried','Pan Fried','Shallow Fried','Wok Fried','Stir Fried','Air Fried',
    'Steamed','Boiled','Poached','Braised','Slow Cooked','Baked','Roasted','Gratin',
    'Raw','Sashimi','Ceviche','Tartare','Salad','Cold',
    'Skewer','Satay','Yakitori','Kebab','On a Stick',
    'Hotpot','Steamboat','Fondue','Shabu Shabu',
    'Buffet','All You Can Eat','Tasting Menu','Set Menu','A La Carte','Omakase','Thali','Bento','Dim Sum','Small Plates','Tapas','Mezze','Sharing Plates','Banchan',
  ],
}

export const DESSERT_KEYWORDS: CategoryBlock = {
  category: 'dessert', type: 'dessert',
  keywords: [
    'Ice Cream','Gelato','Soft Serve','Frozen Yoghurt','Sorbet','Kulfi','Mochi Ice Cream','Ice Cream Sandwich','Rolled Ice Cream',
    'Cake','Chocolate Cake','Cheesecake','Japanese Cheesecake','Basque Cheesecake','Mousse Cake','Layer Cake','Chiffon Cake','Pound Cake','Carrot Cake','Red Velvet','Lemon Drizzle','Opera Cake','Black Forest',
    'Pastry','Croissant','Danish','Cinnamon Roll','Eclair','Profiterole','Choux','Paris-Brest','Mille-Feuille',
    'Tart','Fruit Tart','Egg Tart','Custard Tart',
    'Waffle','Liege Waffle','Belgian Waffle','Bubble Waffle','Churros','Doughnut','Donut','Mochi','Pancake','Crepe','French Toast Dessert',
    'Pudding','Sticky Toffee Pudding','Bread Pudding','Rice Pudding','Kheer','Sago','Panna Cotta','Creme Brulee','Flan','Leche Flan',
    'Chocolate','Brownie','Cookie','Macaron','Profiterole','Tiramisu','Affogato',
    'Baklava','Kunafa','Halva',
    'Asian Dessert','Cendol','Ais Kacang','Che','Tong Sui','Douhua','Tofu Pudding','Tang Yuan','Sesame Ball','Red Bean Soup','Guilinggao','Grass Jelly','Cincau',
    'Malaysian Kuih','Onde-onde','Kuih Lapis','Seri Muka','Kuih Dadar','Kaswi','Putu Piring','Tepung Pelita','Lompat Tikam',
    'Dessert Cafe','Sweet Shop','Patisserie','Bakery','Gelato Shop','Ice Cream Parlour','Waffle House','Dessert Bar',
  ],
}

export const DRINKS_KEYWORDS: CategoryBlock = {
  category: 'drinks', type: 'drink',
  keywords: [
    'Coffee','Espresso','Latte','Flat White','Cappuccino','Americano','Cold Brew','Nitro Coffee','Pour Over','Filter Coffee','Drip Coffee','Long Black','Short Black','Cortado','Macchiato','Vietnamese Coffee','Kopi','Kopi O','White Coffee','Teh Tarik',
    'Tea','Milk Tea','Bubble Tea','Boba','Pearl Milk Tea','Brown Sugar Milk Tea','Taro Milk','Matcha Latte','Thai Milk Tea','Hong Kong Milk Tea','Masala Chai','Karak Tea','Earl Grey','Chamomile','English Breakfast','Oolong','Jasmine Tea','Pu-erh','Gong Cha','Tiger Sugar','Milo Dinosaur',
    'Juice','Fresh Juice','Cold Pressed','Smoothie','Fruit Smoothie','Green Smoothie','Protein Shake','Lemonade','Fresh Lemonade','Sparkling Water','Coconut Water','Sugarcane Juice','Barley Water','Chrysanthemum Tea','Bandung','Sirap Ros','Ribena','Asam Boi','Nutmeg Juice',
    'Milkshake','Frappe','Whipped Drink','Signature Drink',
    'Beer','Craft Beer','IPA','Stout','Lager','Draught Beer','Pale Ale',
    'Wine','Red Wine','White Wine','Rosé','Sparkling Wine','Champagne','Prosecco',
    'Cocktail','Mocktail','Signature Cocktail','Margarita','Mojito','Negroni','Espresso Martini','Old Fashioned','Whisky Sour','Non-Alcoholic Cocktail',
    'Cafe','Coffee Shop','Specialty Coffee','Third Wave Coffee','Bubble Tea Shop','Juice Bar','Smoothie Bar','Bar','Craft Beer Bar','Wine Bar','Rooftop Bar',
  ],
}

export const VENUE_KEYWORDS: CategoryBlock = {
  category: 'venue', type: 'venue',
  keywords: [
    'Hawker Stall','Hawker Centre','Hawker Food','Street Food','Night Market','Pasar Malam','Pasar Pagi','Morning Market','Night Hawker',
    'Kopitiam','Traditional Kopitiam','Hipster Kopitiam','Heritage Cafe','Old School Cafe',
    'Mamak','24-Hour Mamak','Mamak Stall','Roti Canai Stall',
    'Food Court','Food Hall','Food Market','Weekend Market',"Farmer's Market",'Night Bazaar',
    'Cafe','Specialty Cafe','Artisan Cafe','Instagram Cafe','Aesthetic Cafe','Cozy Cafe','Bookstore Cafe','Garden Cafe','Rooftop Cafe','Hidden Cafe','Secret Cafe','Hipster Cafe','Industrial Cafe','Minimalist Cafe','Vintage Cafe',
    'Restaurant','Fine Dining','Casual Dining','Upscale Casual','Farm-to-Table','Farm Dining','Plantation Dining',
    'Fast Food','Quick Service','Fast Casual','Takeaway','Delivery','Drive-Through',
    'Buffet','All You Can Eat','Hotpot Buffet','BBQ Buffet','Steamboat Buffet','International Buffet','Dinner Buffet','Lunch Buffet',
    'Omakase','Chef\'s Table','Tasting Menu','Degustation','Fine Dining Experience',
    'Brasserie','Bistro','Gastropub','Sports Bar','Pub','Beer Garden','Izakaya','Pojangmacha','Pocha',
    'Bakery','Artisan Bakery','Sourdough Bakery','French Bakery','Patisserie','Confectionery',
    'Food Truck','Pop-Up Restaurant','Night Market Stall','Ghost Kitchen','Cloud Kitchen',
    'Family Restaurant','Kid-Friendly','Family Style Dining','Big Table Dining','Communal Dining','Solo Dining','Counter Seat','Bar Seat','Ramen Counter',
    'Rooftop Restaurant','Sky Dining','View Restaurant','Waterfront Dining','Beachside Dining','Garden Restaurant','Alfresco','Outdoor Seating',
    'Private Dining','Members Club','Exclusive Restaurant','Reservation Required','Waitlist Restaurant',
    'Hotel Restaurant','Resort Dining','Poolside Dining','In-Hotel','Five Star Dining',
    'Themed Restaurant','Disney Theme','Retro Diner','1950s Diner','Tropical Theme','Forest Theme','Dark Dining',
  ],
}

export const OCCASION_KEYWORDS: CategoryBlock = {
  category: 'occasion', type: 'occasion',
  keywords: [
    'Birthday Dinner','Celebration','Anniversary',"Valentine's Day",'Date Night','Romantic Dinner',
    'Business Lunch','Corporate Dinner','Client Dinner','Work Lunch','Team Lunch',
    'Family Gathering','Large Group','Party Room','Private Room','Function Hall',
    'Late Night','24 Hours','Supper','Post-Midnight','Supper Spot','Mamak Supper',
    'Weekend Brunch','Sunday Brunch','Brunch Spot','Breakfast','Morning Meal',
    'Lunch','Quick Lunch','Set Lunch','Business Set Lunch','Dinner','Casual Dinner','Fine Dining Dinner',
    'Takeaway','Grab & Go','Packed Lunch','Dabao','Delivery','Online Order','Food Delivery',
    'Outdoor Picnic','Park Dining','Outdoor','Al Fresco',
    'Solo','Eating Alone','Solo Friendly','Counter Seating',
    'Budget Meal','Cheap Eats','Student Meal','RM5 Meal','RM10 Meal','Affordable','Value for Money',
    'Splurge','Special Occasion','Treat Yourself','Premium','Luxury Dining','High End',
    'Open Late','Late Night Eats','After Work Drinks','Happy Hour','Post Work Meal',
  ],
}

export const PRICE_KEYWORDS: CategoryBlock = {
  category: 'price', type: 'price',
  keywords: [
    'Under RM5','RM5 to RM10','RM10 to RM20','RM20 to RM50','RM50 to RM100','RM100 and above',
    'Budget Friendly','Cheap Eats','Student Budget','Pocket Friendly','Affordable',
    'Mid Range','Mid Tier','Premium','Upscale','Fine Dining Price','Tasting Menu Price',
    'Splurge Worthy','Anniversary Worthy',
    '$','$$','$$$','$$$$',
  ],
}
