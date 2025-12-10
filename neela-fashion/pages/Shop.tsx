
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search, ChevronDown } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { useCMS } from '../context/CMSContext';
import { Product } from '../types';

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialSearch = searchParams.get('search');

  // Use data from CMS Context
  const { products, categories } = useCMS();

  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [searchQuery, setSearchQuery] = useState<string>(initialSearch || '');
  const [priceSort, setPriceSort] = useState<'default' | 'asc' | 'desc'>('default');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Update filtered products when products context updates or filters change
  useEffect(() => {
    let result = products;

    if (selectedCategory !== 'All') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.subCategory.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }

    if (priceSort === 'asc') {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (priceSort === 'desc') {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    }

    setFilteredProducts([...result]);
  }, [selectedCategory, searchQuery, priceSort, products]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
    
    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [searchParams]);

  return (
    <div className="pt-40 pb-16 min-h-screen bg-sand-50">
      <div className="container mx-auto px-6 md:px-12">
        {/* Luxury Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h1 className="text-5xl font-serif text-navy-900 mb-4">The Collection</h1>
          <div className="w-20 h-0.5 bg-gold-500 mx-auto"></div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className={`lg:w-1/4 ${isFilterOpen ? 'block' : 'hidden lg:block'} animate-fade-in`} style={{ animationDelay: '0.2s' }}>
            <div className="sticky top-32 space-y-8">
              <div>
                  <h3 className="font-serif text-xl text-navy-900 mb-6">Categories</h3>
                  <ul className="space-y-4">
                    <li>
                      <button 
                        onClick={() => { setSelectedCategory('All'); setSearchParams({}); }}
                        className={`text-sm uppercase tracking-widest transition-colors ${selectedCategory === 'All' ? 'text-gold-600 font-bold pl-2 border-l-2 border-gold-600' : 'text-gray-500 hover:text-navy-900'}`}
                      >
                        View All
                      </button>
                    </li>
                    {Object.keys(categories).map(cat => (
                      <li key={cat}>
                        <button 
                          onClick={() => { setSelectedCategory(cat); setSearchParams({ category: cat }); }}
                          className={`text-sm uppercase tracking-widest text-left transition-all duration-300 ${selectedCategory === cat ? 'text-gold-600 font-bold pl-2 border-l-2 border-gold-600' : 'text-gray-500 hover:text-navy-900 hover:pl-2'}`}
                        >
                          {cat}
                        </button>
                      </li>
                    ))}
                  </ul>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <button 
                className="lg:hidden flex items-center text-navy-900 font-bold uppercase tracking-widest text-xs"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter size={16} className="mr-2" /> Filters
              </button>

              <div className="relative w-full md:w-auto flex-1 max-w-md group">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-0 pr-4 py-2 bg-white border-b border-gray-300 focus:outline-none focus:border-navy-900 transition-colors placeholder-gray-400"
                />
                <Search size={16} className="absolute right-0 top-2.5 text-gray-400 group-hover:text-navy-900 transition-colors" />
              </div>

              <div className="relative">
                 <select 
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value as any)}
                    className="appearance-none bg-white border-b border-gray-300 py-2 pr-8 pl-2 focus:outline-none focus:border-navy-900 cursor-pointer text-sm text-gray-600 uppercase tracking-widest"
                 >
                    <option value="default">Sort: Recommended</option>
                    <option value="asc">Price: Low to High</option>
                    <option value="desc">Price: High to Low</option>
                 </select>
                 <ChevronDown size={14} className="absolute right-2 top-3 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                {filteredProducts.map((product, index) => (
                  <div key={product.id} className="animate-fade-in-up" style={{ animationDelay: `${0.1 * (index % 5)}s` }}>
                      <ProductCard product={product} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 border border-dashed border-gray-300">
                <h3 className="font-serif text-xl text-gray-400 mb-2">No Matches Found</h3>
                <button onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }} className="text-gold-600 underline">Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;
