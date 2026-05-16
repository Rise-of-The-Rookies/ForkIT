/* ForkIt — Western + European keywords */
import type { CategoryBlock } from './types'

export const WESTERN_KEYWORDS: CategoryBlock = {
  category: 'western', type: 'dish', cuisineTag: 'Western',
  keywords: [
    'Burger','Cheeseburger','Double Smash Burger','Wagyu Burger','Truffle Burger','Fried Chicken Burger','Crispy Chicken Burger','Pulled Pork Burger',
    'Fries','Curly Fries','Loaded Fries','Truffle Fries','Cheese Fries','Chili Fries',
    'Hot Dog','Corn Dog','Bratwurst','Hotlink',
    'Pizza','Margherita','Pepperoni','BBQ Chicken Pizza','Hawaiian Pizza','Neapolitan Pizza','New York Style Pizza','Detroit Style Pizza','Calzone',
    'Steak','Ribeye','Sirloin','T-Bone','Filet Mignon','Wagyu Steak','Striploin','Grilled Chicken','Surf & Turf',
    'Pasta','Spaghetti','Carbonara','Bolognese','Aglio e Olio','Pesto Pasta','Penne Arrabiata','Fettuccine','Lasagna','Linguine','Rigatoni','Mac & Cheese',
    'Sandwich','Club Sandwich','BLT','Philly Cheesesteak','Rueben','Grilled Cheese',
    'Fish & Chips','Bangers & Mash',"Shepherd's Pie",'Beef Pie','Sunday Roast','Yorkshire Pudding',
    'Fried Chicken','Southern Fried Chicken','Nashville Hot Chicken','Buttermilk Chicken',
    'Waffles','Chicken & Waffles',
    'Ribs','Baby Back Ribs','BBQ Brisket','Pulled Pork','Smoked Meat','BBQ Wings','Wings','Buffalo Wings',
    'Tacos','Burrito','Quesadilla','Nachos','Enchilada','Fajita','Chimichanga',
    'Brunch','Eggs Benedict','Avocado Toast','Big Breakfast','Full English Breakfast','Pancakes','French Toast','Waffles Brunch','Shakshuka','Omelette','Frittata','Hash Brown','Smashed Avocado',
    'Salad','Caesar Salad','Niçoise','Cobb Salad','Greek Salad',
    'Soup','Clam Chowder','Tomato Soup','Mushroom Soup','French Onion Soup','Lobster Bisque',
    'Burger Joint','Steakhouse','American Diner','Grill Restaurant','BBQ Joint','Pizza Restaurant','Pizzeria','Brunch Cafe','Sports Bar & Grill',
  ],
}

export const EUROPEAN_KEYWORDS: CategoryBlock = {
  category: 'european', type: 'dish', cuisineTag: 'European',
  keywords: [
    'Croissant','Pain au Chocolat','Baguette','Escargot','Croque Monsieur','Crepe','Galette','Quiche','French Onion Soup','Boeuf Bourguignon','Coq au Vin','Ratatouille','Bouillabaisse','Foie Gras','Steak Tartare','Beef Bourguignon','Confit de Canard',
    'Rissoto','Bruschetta','Caprese','Tiramisu','Panna Cotta','Gelato','Cannoli','Arancini','Osso Buco','Saltimbocca','Veal Milanese',
    'Tapas','Paella','Gazpacho','Patatas Bravas','Jamón','Churros','Crema Catalana','Sangria',
    'Sausage','Bratwurst','Schnitzel','Sauerbraten','Pretzels','Spaetzle','Strudel','Black Forest Cake','German Bread',
    'Stroganoff','Borscht','Pierogi','Blinis','Beef Goulash','Chicken Kyiv',
    'Fish','Smoked Salmon','Gravlax','Scandinavian Open Sandwich','Smørrebrød','Pickled Herring',
    'Greek Souvlaki','Moussaka','Spanakopita','Tzatziki','Gyros','Baklava Greek','Loukoumades','Saganaki',
    'Portuguese Pastel de Nata','Bacalhau','Piri Piri Chicken','Caldo Verde',
    'Fondue','Swiss Cheese','Raclette','Belgian Waffle','Moules Frites','Beef Carbonnade',
    'French Bistro','French Brasserie','Italian Trattoria','Italian Osteria','Spanish Tapas Bar','Greek Taverna','German Beer Hall','Bistro','Brasserie',
  ],
}
