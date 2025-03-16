// Sample food data with real images from the web
window.sampleFoodData = [
    {
        _id: 'b1',
        name: 'Classic Breakfast',
        description: 'Two eggs any style, crispy bacon, golden hash browns, and toast. Served with a side of fresh fruit and your choice of coffee or orange juice.',
        price: 12.99,
        category: 'Breakfast',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1533089860892-a9b969df67d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'b2',
        name: 'Belgian Waffles',
        description: 'Fluffy, golden waffles served with pure maple syrup, whipped butter, and topped with fresh berries and a dusting of powdered sugar.',
        price: 10.99,
        category: 'Breakfast',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1562376552-0d160a2f35b6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'b3',
        name: 'Avocado Toast',
        description: 'Rustic sourdough bread topped with smashed avocado, cherry tomatoes, micro greens, and a sprinkle of red pepper flakes. Served with two poached eggs.',
        price: 14.99,
        category: 'Breakfast',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1603046891744-76139d394356?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'b4',
        name: 'Eggs Benedict',
        description: 'Two poached eggs on toasted English muffins with Canadian bacon, topped with hollandaise sauce and served with breakfast potatoes.',
        price: 15.99,
        category: 'Breakfast',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'l1',
        name: 'Gourmet Burger',
        description: 'Prime Angus beef patty, aged cheddar, caramelized onions, crispy bacon, lettuce, tomato, and our special sauce on a brioche bun. Served with truffle fries.',
        price: 18.99,
        category: 'Lunch',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'l2',
        name: 'Caesar Salad',
        description: 'Crisp romaine lettuce with house-made Caesar dressing, shaved parmesan, garlic croutons, and anchovy fillets. Add grilled chicken or shrimp for an additional charge.',
        price: 12.99,
        category: 'Lunch',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1551248429-40975aa4de74?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'l3',
        name: 'Club Sandwich',
        description: 'Triple-decker sandwich with roasted turkey, ham, bacon, Swiss cheese, lettuce, tomato, and mayo on toasted sourdough. Served with a side of coleslaw and potato chips.',
        price: 15.99,
        category: 'Lunch',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'l4',
        name: 'Mediterranean Bowl',
        description: 'A healthy bowl of quinoa, falafel, cucumber, cherry tomatoes, Kalamata olives, feta cheese, and hummus, drizzled with tzatziki sauce.',
        price: 16.99,
        category: 'Lunch',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'd1',
        name: 'Filet Mignon',
        description: '8oz prime filet with red wine reduction, served with truffle mashed potatoes and roasted asparagus. Cooked to your preference.',
        price: 32.99,
        category: 'Dinner',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1558030006-450675393462?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'd2',
        name: 'Grilled Salmon',
        description: 'Wild-caught salmon with lemon-dill sauce, served with wild rice pilaf and seasonal vegetables. Sustainably sourced.',
        price: 26.99,
        category: 'Dinner',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'd3',
        name: 'Mushroom Risotto',
        description: 'Creamy Arborio rice slowly cooked with a mix of wild mushrooms, white wine, shallots, and finished with parmesan and truffle oil.',
        price: 22.99,
        category: 'Dinner',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'd4',
        name: 'Chicken Parmesan',
        description: 'Breaded chicken breast topped with marinara sauce and melted mozzarella, served over linguine with garlic bread on the side.',
        price: 24.99,
        category: 'Dinner',
        isVeg: false,
        image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'de1',
        name: 'Chocolate Lava Cake',
        description: 'Warm chocolate cake with a molten center, served with vanilla bean ice cream, fresh berries, and a raspberry coulis.',
        price: 10.99,
        category: 'Desserts',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'de2',
        name: 'New York Cheesecake',
        description: 'Classic creamy cheesecake with a graham cracker crust, topped with a mixed berry compote and fresh mint.',
        price: 9.99,
        category: 'Desserts',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1533134242453-d810bb55cbd1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'de3',
        name: 'Tiramisu',
        description: 'Layers of espresso-soaked ladyfingers and mascarpone cream, dusted with cocoa powder and served with chocolate-covered espresso beans.',
        price: 8.99,
        category: 'Desserts',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1571877899317-435708901955?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
        _id: 'de4',
        name: 'Crème Brûlée',
        description: 'Classic vanilla bean custard with a caramelized sugar crust, garnished with fresh berries and an almond tuile.',
        price: 11.99,
        category: 'Desserts',
        isVeg: true,
        image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    }
]; 