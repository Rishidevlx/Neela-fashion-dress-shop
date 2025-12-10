export interface Product {
  id: number;
  name: string;
  category: string;
  subCategory: string;
  price: number;
  discountPrice?: number;
  image: string;
  images?: string[];
  description: string;
  material: string;
  rating: number;
  stock: number; // Total Stock (Sum of all sizes)
  sizeStock?: { [key: string]: number }; // NEW: { "S": 10, "M": 0, "L": 5 }
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string; // NEW: Stores "M", "L", etc.
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  joinDate: string;
  isActive: boolean; 
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  date: string;
  total: number;
  status: OrderStatus;
  paymentMethod: 'Prepaid' | 'COD'; 
  items: CartItem[];
  billingDetails: ShippingDetails;
  shippingDetails: ShippingDetails;
  notes?: string;
}

export interface Review {
  id: string;
  productId: number;
  productName: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  image?: string;
}

export interface CategoryStructure {
  [key: string]: string[];
}

export type ShippingRuleType = 'fixed' | 'per_piece' | 'every_2' | 'every_3' | 'every_10';

export interface ShippingRule {
  state: string; 
  minQty: number;
  maxQty: number;
  cost: number;
  type: ShippingRuleType; 
}

export interface ShippingRulesMap {
    [category: string]: ShippingRule[];
}

export interface Testimonial {
  id: number;
  text: string;
  author: string;
  role: string;
}

export interface HomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  marqueeText: string[];
  sectionTitleTrends: string; 
  sectionTitleFeatured: string;
  sectionTitleTestimonials: string;
  testimonials: Testimonial[];
  trendImages: {
    large: string;
    topRight: string;
    bottomRight: string;
  }
}

export interface GlobalSettings {
  logoUrl: string;
  siteName: string;
  currency: string;
  logoWidth: string;
  taxRate: number;
  instagramUrl: string;
  youtubeUrl: string;
  whatsappNumber: string;
  contactNumber: string;
}

export interface AboutContent {
  title: string;
  description: string;
  heroImage: string;
}

export interface ContactContent {
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
  heroImage: string;
}

export const CATEGORIES: CategoryStructure = {
  "Bottom Wear": ["Ankle Length", "Cotton Patiyala", "Four way Leggins", "Full Length", "Leggins", "Patiyala", "Two way Leggins", "Viscose Patiyala"],
  "Dupatta": ["Low Price Dupatta", "Nazeem Dupatta", "Plain Cotton Dupatta", "Printed Cotton Dupatta"],
  "Inner wear": ["Brasier", "Panties", "Slips"],
  "Kurtis Collections": ["A line Kurti", "Aliya cut Kurti", "Feeding Kurti", "Long Gown", "Nyra Cut Kurti", "Side Open Kurti", "Three piece set", "Two Piece Set", "Umberlla Kurti"],
  "Nighty": ["3/4 Nighty", "60 Inch Nighty", "Baniyan Cloth Night Dress", "Cotton Night Dress", "Dupatta Nighty", "Feeding Nighty", "Feeding Zipless", "Full Open Nighty", "Non Feeding", "Other Brand Nighty", "Pranjul brand nighty", "T-Shirts"],
  "Unstiched Material": ["Cotton Material", "Georgette material", "Other Material", "Silk Material"],
  "Readymade": ["Cotton with Lining", "Cotton without Lining", "Mixed Cotton Fullset", "Rayon Fullset", "Two piece set"],
  "Saree": ["Cotton Saree", "Creape Saree", "Linen Saree", "Poonam Saree", "Silk Saree"]
};

export const INDIAN_STATES = [
  "All States",
  "Other States",
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", 
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", 
  "Lakshadweep", "Puducherry"
];

export const SHIPPING_TYPES: { value: ShippingRuleType, label: string }[] = [
  { value: 'fixed', label: 'No Per Piece (Fixed Price)' },
  { value: 'per_piece', label: 'Per Piece Extra' },
  { value: 'every_2', label: 'Two Piece Extra' },
  { value: 'every_3', label: 'Three Piece Extra' },
  { value: 'every_10', label: 'Ten Piece Extra' },
];

export const AVAILABLE_SIZES = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];