import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { cartAPI, wishlistAPI } from "../services/api";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { isAuthenticated } = useAuth();
  const [adding, setAdding] = useState(false);

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    setAdding(true);
    try {
      await cartAPI.add(product.id);
    } catch {
      // handle error silently
    }
    setAdding(false);
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = "/login";
      return;
    }
    try {
      await wishlistAPI.toggle(product.id);
    } catch {
      // handle error silently
    }
  };

  return (
    <Link to={`/product/${product.id}`} className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
            -{discount}%
          </span>
        )}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleToggleWishlist}
            className="p-2 bg-white rounded-full shadow hover:bg-orange-50 transition-colors"
          >
            <Heart size={16} className="text-gray-600" />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={adding}
            className="p-2 bg-white rounded-full shadow hover:bg-orange-50 transition-colors"
          >
            <ShoppingCart size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">{product.name}</h3>
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={12}
              className={i < Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.reviews_count})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-orange-500">${product.price.toFixed(2)}</span>
          {product.original_price && (
            <span className="text-sm text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
