import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, Minus, Plus, ArrowLeft } from "lucide-react";
import { productsAPI, cartAPI, wishlistAPI } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedMessage, setAddedMessage] = useState("");

  useEffect(() => {
    if (id) {
      productsAPI
        .getById(parseInt(id))
        .then((res) => setProduct(res.data))
        .catch(() => navigate("/home"))
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setAdding(true);
    try {
      await cartAPI.add(product.id, quantity);
      setAddedMessage("Added to cart!");
      setTimeout(() => setAddedMessage(""), 2000);
    } catch {
      setAddedMessage("Failed to add");
    }
    setAdding(false);
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const res = await wishlistAPI.toggle(product.id);
      setAddedMessage(res.data.added ? "Added to wishlist!" : "Removed from wishlist");
      setTimeout(() => setAddedMessage(""), 2000);
    } catch {
      // handle silently
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Loading...</div>;
  }

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">Product not found</div>;
  }

  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-6 transition-colors"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div>
          <p className="text-sm text-orange-500 font-medium uppercase tracking-wide mb-2">{product.category}</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={i < Math.round(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">({product.reviews_count} reviews)</span>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-bold text-orange-500">${product.price.toFixed(2)}</span>
            {product.original_price && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.original_price.toFixed(2)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-medium px-2 py-0.5 rounded">-{discount}%</span>
              </>
            )}
          </div>

          <p className="text-gray-600 mb-8 leading-relaxed">{product.description}</p>

          {/* Quantity */}
          <div className="flex items-center gap-4 mb-6">
            <span className="text-sm font-medium text-gray-700">Quantity:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="px-4 py-2 text-sm font-medium min-w-8 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="p-2 hover:bg-gray-100 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToCart}
              disabled={adding}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              {adding ? "Adding..." : "Add to Cart"}
            </button>
            <button
              onClick={handleToggleWishlist}
              className="p-3 border border-gray-300 rounded-lg hover:border-orange-500 hover:text-orange-500 transition-colors"
            >
              <Heart size={20} />
            </button>
          </div>

          {addedMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600 text-center">
              {addedMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
