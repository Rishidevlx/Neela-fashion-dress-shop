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
  stock: number;
  sizeStock?: { [key: string]: number };
  sizePrices?: { [key: string]: number }; // NEW: Size specific price
  showFreeSize?: boolean; // Toggle for "Free Size" display
}

export interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  // Note: we can carry the resolved price here, or recalculate. 
  // Sticking to Product definition is fine as we can look up sizePrices.
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
  district?: string;
  state?: string;
  pincode?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Payment Failed';

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
  paymentMethod: 'Prepaid' | 'COD' | 'Prepaid (PhonePe)'; 
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

export const AVAILABLE_SIZES = ["Free Size", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
export const KIDS_SIZES = [
  "Free Size", "0-6 month", "6-12 month", "1-2 years", "2-3 years", "3-4 years", 
  "4-5 years", "5-6 years", "6-7 years", "7-8 years", "8-9 years", 
  "9-10 years", "10-11 years", "11-12 years", "12-13 years", 
  "13-14 years", "14-15 years", "15-16 years", "16-17 years"
];