/* ForkIt — Seafood, Vegetarian/Vegan, Dietary keywords */
import type { CategoryBlock } from './types'

export const SEAFOOD_KEYWORDS: CategoryBlock = {
  category: 'seafood', type: 'ingredient', cuisineTag: 'Seafood',
  keywords: [
    'Seafood','Prawns','Shrimp','Lobster','Crab','Soft Shell Crab','Mantis Prawn','Tiger Prawn','King Prawn',
    'Fish','Sea Bass','Snapper','Salmon','Tuna','Barramundi','Pomfret','Mackerel','Grouper','Sole','Cod','Halibut',
    'Clams','Mussels','Oysters','Scallops','Squid','Sotong','Cuttlefish','Octopus','Abalone','Sea Urchin','Sea Cucumber',
    'Swordfish','Swordfish Steak','Anchovy','Sardine','Dried Shrimp','Udang Kering',
    'Grilled Fish','Steamed Fish','Deep Fried Fish','Salt Baked Fish','Crispy Fish','Asam Pedas Fish',
    'Spicy Butter Prawns','Kam Heong Prawn','Salted Egg Crab',
    'Seafood Restaurant','Seafood Platter','Seafood Buffet','Fish Market','Seafood Hotpot',
    'Lala','Kerang','Cockles',
  ],
}

export const VEGETARIAN_KEYWORDS: CategoryBlock = {
  category: 'vegetarian_vegan', type: 'diet', cuisineTag: 'Vegetarian',
  keywords: [
    'Vegetarian','Vegan','Plant-Based','Meat-Free',
    'Tofu','Tempeh','Seitan','Jackfruit','Mushroom Steak','Mushroom Burger','Cauliflower Steak',
    'Beyond Meat','Impossible Burger',
    'Veggie Bowl','Buddha Bowl','Grain Bowl','Nourish Bowl','Power Bowl',
    'Falafel Wrap','Hummus Bowl','Lentil Soup','Bean Burrito','Avocado Toast',
    'Smoothie Bowl','Acai Bowl','Green Smoothie',
    'Salad','Kale Salad','Quinoa Salad','Raw Food','Detox Bowl',
    'Vegetarian Indian','Veggie Curry','Dal','Chana Masala','Aloo Gobi','Palak Paneer','Rajma',
    'Chinese Vegetarian','Mock Meat','Vegetarian Dim Sum','Yong Tau Foo',
    'Vegetarian Ramen','Miso Soup Vegetarian','Vegetable Sushi','Inari',
    'Vegan Cafe','Vegetarian Restaurant','Plant-Based Cafe','Organic Restaurant','Healthy Bowl Restaurant',
  ],
}

export const DIETARY_KEYWORDS: CategoryBlock = {
  category: 'dietary', type: 'diet',
  keywords: [
    'Halal','Halal Certified','Muslim Friendly','No Pork No Lard','Pork Free',
    'Kosher','Gluten-Free','Gluten Free Option','Celiac Friendly',
    'Dairy-Free','Lactose Free','Vegan','Vegetarian','Pescatarian',
    'Keto','Ketogenic','Low Carb','Low Carb Option','Paleo',
    'Low Calorie','Calorie Counted','Diet Friendly','Healthy Options','High Protein',
    'Diabetic Friendly','Low Sugar','Sugar Free','No MSG','Clean Eating',
    'Organic','Farm to Table','Locally Sourced','Sustainable','Free Range',
    'Nut Allergy Friendly','Shellfish Free','Soy Free','Egg Free',
    'Raw Food','Whole Food','Superfood',
    'Halal Steakhouse','Halal Japanese','Halal Korean','Halal Sushi','Halal Chinese','Halal Western',
  ],
}
