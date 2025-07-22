const express = require('express');
const consul = require('consul')({ host: 'consul' });
const cors = require('cors');
const app = express();

const serviceName = 'product-service';
const serviceId = `product-service`;

// Configure CORS
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());


const PRODUCTS = [
  {
    id: 'p1',
    name: 'iPhone 14',
    category: 'electronics',
    description: 'The iPhone 14 features a stunning Super Retina XDR display, A15 Bionic chip, improved dual-camera system with Photonic Engine, and all-day battery life in a sleek and durable aluminum design.',
    price: 99999,
    stock: 10
  },
  {
    id: 'p2',
    name: 'MacBook Air M2',
    category: 'electronics',
    description: 'MacBook Air is strikingly thin and comes with the Apple M2 chip, delivering exceptional speed and power efficiency with a fanless design, Liquid Retina display, and all-day battery life for work or play.',
    price: 119900,
    stock: 5
  },
  {
    id: 'p3',
    name: 'Nike Air Zoom Pegasus',
    category: 'fashion',
    description: 'Nike Air Zoom Pegasus is a versatile running shoe that offers a breathable upper, responsive cushioning, and a secure fit ideal for daily training and long runs with enhanced grip and support.',
    price: 8499,
    stock: 8
  },
  {
    id: 'p4',
    name: 'Sony WH-1000XM5',
    category: 'electronics',
    description: 'Industry-leading noise cancellation headphones with Auto NC Optimizer that adapts to your environment and wearing conditions. Features crystal-clear sound, long battery life, and intuitive touch control.',
    price: 29999,
    stock: 6
  },
  {
    id: 'p5',
    name: 'Samsung QLED 4K Smart TV',
    category: 'electronics',
    description: 'Samsungs QLED Smart TV offers Quantum Dot technology for vivid color, 4K UHD resolution, integrated voice assistant, and a sleek, modern design that blends seamlessly into your living space.',
    price: 68990,
    stock: 12
  },
  {
    id: 'p6',
    name: 'Levi’s 511 Slim Jeans',
    category: 'fashion',
    description: 'A modern slim fit with room to move, Levi 511 Jeans are a classic wardrobe staple made from stretch denim, offering comfort and style whether youre dressing up or down.',
    price: 2999,
    stock: 15
  },
  {
    id: 'p7',
    name: 'Amazon Kindle Paperwhite',
    category: 'electronics',
    description: 'The Kindle Paperwhite features a high-resolution glare-free display, adjustable warm light, and waterproof design, making it perfect for reading anywhere, even in bright sunlight or at the beach.',
    price: 13999,
    stock: 20
  },
  {
    id: 'p8',
    name: 'Bose SoundLink Revolve+ II',
    category: 'electronics',
    description: 'Portable Bluetooth speaker with 360° sound, deep bass, durable water-resistant build, long-lasting battery, and voice assistant integration. Perfect for indoor and outdoor entertainment.',
    price: 24990,
    stock: 4
  },
  {
    id: 'p9',
    name: 'HP Envy x360 Convertible',
    category: 'electronics',
    description: 'HP Envy x360 is a powerful 2-in-1 laptop with AMD Ryzen processor, touchscreen display, lightweight build, and long battery life, ideal for productivity, creativity, and entertainment on the go.',
    price: 74990,
    stock: 9
  },
  {
    id: 'p10',
    name: 'Fitbit Versa 4',
    category: 'electronics',
    description: 'A sleek smartwatch for health and fitness tracking, featuring heart rate monitoring, GPS, sleep tracking, 6+ day battery life, and compatibility with Android and iOS devices.',
    price: 16999,
    stock: 14
  },
  {
    id: 'p11',
    name: 'Puma Men’s Sports Jacket',
    category: 'fashion',
    description: 'Puma sports jacket offers lightweight comfort, water resistance, and sporty style. Perfect for workouts or casual outings, it features breathable fabric and reflective branding.',
    price: 4599,
    stock: 11
  },
  {
    id: 'p12',
    name: 'Asus ROG Strix G15',
    category: 'electronics',
    description: 'Gaming laptop powered by AMD Ryzen 7 and NVIDIA GeForce RTX graphics, with a high-refresh-rate display, optimized cooling system, and RGB backlit keyboard designed for competitive gameplay.',
    price: 124990,
    stock: 7
  },
  {
    id: 'p13',
    name: 'Sony Alpha ZV-E10',
    category: 'electronics',
    description: 'A mirrorless camera designed for content creators, with interchangeable lens capability, 4K video recording, fast autofocus, and advanced audio input features for professional-grade results.',
    price: 69999,
    stock: 5
  },
  {
    id: 'p14',
    name: 'Ray-Ban Wayfarer Classic',
    category: 'fashion',
    description: 'Iconic sunglasses with UV protection and timeless style, Ray-Ban Wayfarers suit all face types and are crafted with durable acetate frames for a sleek and fashionable look.',
    price: 6490,
    stock: 13
  },
  {
    id: 'p15',
    name: 'LG 260 L Double Door Refrigerator',
    category: 'electronics',
    description: 'Smart inverter compressor for energy efficiency and silent operation. Comes with auto defrost, toughened glass shelves, and ample freezer space for modern households.',
    price: 26990,
    stock: 10
  },
    {
    id: 'p16',
    name: 'OnePlus 12R 5G',
    category: 'electronics',
    description: 'OnePlus 12R comes with a Snapdragon 8 Gen 1 processor, 120Hz AMOLED display, fast 100W charging, and a triple camera setup designed to deliver flagship performance at a mid-range price.',
    price: 42999,
    stock: 18
  },
  {
    id: 'p17',
    name: 'Boat Airdopes 441 Pro',
    category: 'electronics',
    description: 'Wireless earbuds with immersive audio, IPX7 water resistance, long battery life, and a stylish case with LED display, ideal for workouts and everyday use.',
    price: 2499,
    stock: 30
  },
  {
    id: 'p18',
    name: 'Canon PIXMA G3020',
    category: 'electronics',
    description: 'All-in-one wireless ink tank color printer designed for home and office use. Offers high page yield, cost-efficient printing, and supports seamless mobile connectivity.',
    price: 16999,
    stock: 8
  },
  {
    id: 'p19',
    name: 'Allen Solly Men’s Formal Shirt',
    category: 'fashion',
    description: 'Premium cotton formal shirt with a tailored fit, button-down collar, and classic design. Perfect for business meetings or formal events, combining comfort with elegance.',
    price: 1799,
    stock: 22
  },
  {
    id: 'p20',
    name: 'Samsung Galaxy Tab S9 FE',
    category: 'electronics',
    description: 'A high-performance Android tablet with S Pen support, vibrant display, long-lasting battery, and multitasking features suited for both productivity and entertainment.',
    price: 32999,
    stock: 6
  },
  {
    id: 'p21',
    name: 'Fossil Gen 6 Smartwatch',
    category: 'electronics',
    description: 'Advanced Wear OS smartwatch with Snapdragon Wear 4100+, built-in GPS, heart rate tracking, and customizable watch faces. Supports Alexa and fast charging.',
    price: 22999,
    stock: 12
  },
  {
    id: 'p22',
    name: 'Zara Women’s Midi Dress',
    category: 'fashion',
    description: 'Elegant midi dress with a floral print, puff sleeves, and a flared silhouette. Made from breathable fabric, ideal for casual outings, brunches, or summer vacations.',
    price: 3590,
    stock: 10
  },
  {
    id: 'p23',
    name: 'Realme Smart TV 4K',
    category: 'electronics',
    description: 'Ultra HD 4K smart television with Dolby Vision, quad speakers with Dolby Atmos, and Android TV OS support for seamless streaming and voice command capabilities.',
    price: 27999,
    stock: 9
  },
  {
    id: 'p24',
    name: 'Philips Hair Straightener HP8302',
    category: 'electronics',
    description: 'Compact and fast-heating ceramic plates for smooth and shiny hair. Easy to carry and use, making it perfect for everyday styling needs.',
    price: 1399,
    stock: 25
  },
  {
    id: 'p25',
    name: 'Wrangler Men’s Denim Jacket',
    category: 'fashion',
    description: 'Classic fit denim jacket with full sleeves, button closures, and rugged style. A timeless outerwear piece for layering across seasons.',
    price: 3899,
    stock: 16
  },
  {
    id: 'p26',
    name: 'Mi Home Security Camera 360°',
    category: 'electronics',
    description: '1080p full HD smart security camera with infrared night vision, AI motion detection, and 360-degree coverage. Control remotely using the Mi Home app.',
    price: 2990,
    stock: 14
  },
  {
    id: 'p27',
    name: 'Wildcraft Backpack 44L',
    category: 'fashion',
    description: 'Spacious and durable backpack with multiple compartments, laptop sleeve, ergonomic straps, and water-resistant build — perfect for students and travelers.',
    price: 1999,
    stock: 17
  },
  {
    id: 'p28',
    name: 'Tissot Men’s Chronograph Watch',
    category: 'fashion',
    description: 'A luxury timepiece with Swiss quartz movement, stainless steel case, sapphire crystal, and water resistance — combining elegance and performance.',
    price: 35990,
    stock: 4
  },
  {
    id: 'p29',
    name: 'Apple AirPods Pro (2nd Gen)',
    category: 'electronics',
    description: 'Premium wireless earbuds with active noise cancellation, adaptive transparency, spatial audio, and improved battery life — now with MagSafe charging case.',
    price: 26999,
    stock: 11
  },
  {
    id: 'p30',
    name: 'Reebok Men’s Running T-Shirt',
    category: 'fashion',
    description: 'Lightweight and breathable sports t-shirt made from moisture-wicking fabric, designed to keep you cool and dry during intense workouts or outdoor runs.',
    price: 1299,
    stock: 20
  }
];


app.get('/health', (req, res) => res.send('OK'));


app.get('/products', (req, res) => {
  const { search = '', category = '' } = req.query;
  const result = PRODUCTS.filter(p =>
    (p.name.toLowerCase().includes(search.toLowerCase()) || search === '') &&
    (p.category.toLowerCase() === category.toLowerCase() || category === '')
  );
  
  // returning serviceId to check the load balancer functionality
  res.status(200).json({
    servedBy: serviceId,
    data:result});
})

app.get('/products/:id', (req, res) => {
  const product = PRODUCTS.find(p => p.id === req.params.id);
  if (product) return res.status(200).json(product);
  res.status(404).json({ message: 'Product not found' });
})

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`${serviceName} running on port ${PORT}`);

  // Register service with Consul
  consul.agent.service.register({
    id: serviceId,
    name: serviceName,
    address: serviceName,
    port: PORT,
    check: {
      http: `http://${serviceName}:${PORT}/health`,
      interval: '10s'
    }
  }, err => {
    if (err) console.error('Error registering service:', err);
  });
});








