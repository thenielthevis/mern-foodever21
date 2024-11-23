import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import { Breadcrumbs, Link, Typography, Slider } from '@mui/material';
import Toast from "../Layout/Toast";
import Swal from 'sweetalert2';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      title: 'Loading products...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API}/products`);
        if (response.data && response.data.products) {
          setProducts(response.data.products);
        } else {
          console.error("No products data found");
          Toast("No products available", "error");
        }
        setLoading(false);
        Swal.close();
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
        Swal.close();
        Toast("Failed to load products", "error");
      }
    };

    fetchProducts();
  }, []);

  const sortProducts = (unsortedProducts, order) => {
    let sortedProducts = [...unsortedProducts];
    switch (order) {
      case 'low-to-high':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'high-to-low':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'a-z':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'z-a':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return sortedProducts;
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
  };

  const handleCategoryChange = (event) => {
    const { value, checked } = event.target;
    if (checked) {
      setSelectedCategories((prev) => [...prev, value]);
    } else {
      setSelectedCategories((prev) => prev.filter((category) => category !== value));
    }
  };

  const handleRatingChange = (event, newValue) => {
    setRatingFilter(newValue);
  };

  const filteredProducts = products
    .filter((product) => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const ratingMatch = ratingFilter === null || product.ratings === ratingFilter;
      return categoryMatch && ratingMatch;
    })
    .sort((a, b) => {
      // Apply sorting only on filtered products
      const sorted = sortProducts([a, b], sortOrder);
      return sorted.indexOf(a) - sorted.indexOf(b);
    });

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="products-page">
      <div className="breadcrumbs-container">
        <Breadcrumbs aria-label="breadcrumb">
          <Link color="inherit" href="/" onClick={() => navigate('/')}>
            Home
          </Link>
          <Typography color="textPrimary">Menu</Typography>
        </Breadcrumbs>
      </div>

      <div className="products-content">
        <div className="products-sidebar">
          <h5>Sort by</h5>
          <select onChange={handleSortChange}>
            <option value="">Select</option>
            <option value="low-to-high">Price: Low to High</option>
            <option value="high-to-low">Price: High to Low</option>
            <option value="a-z">A-Z</option>
            <option value="z-a">Z-A</option>
          </select>

          <h5>Category</h5>
          <div>
            <input type="checkbox" id="pasta" name="category" value="Pasta" onChange={handleCategoryChange} />
            <label htmlFor="pasta">Pasta</label>
          </div>
          <div>
            <input type="checkbox" id="rice" name="category" value="Rice Meal" onChange={handleCategoryChange} />
            <label htmlFor="rice">Rice Meal</label>
          </div>
          <div>
            <input type="checkbox" id="sandwich" name="category" value="Sandwich" onChange={handleCategoryChange} />
            <label htmlFor="sandwich">Sandwich</label>
          </div>

          <h5>Ratings</h5>
          <Box sx={{ width: 200 }}>
            <Slider
              className="custom-slider"
              size="small"
              min={-1}
              max={5}
              step={1}
              value={ratingFilter === null ? -1 : ratingFilter}
              onChange={(event, newValue) => setRatingFilter(newValue === -1 ? null : newValue)}
              aria-label="Rating Filter"
              valueLabelDisplay="off"
            />
            <Typography variant="caption">
              {ratingFilter === null
                ? 'All Products'
                : ratingFilter === 0
                ? 'Rating: 0'
                : `Rating: ${ratingFilter}`}
            </Typography>
          </Box>
        </div>

        <div className="products-container">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => navigate(`/product/${product._id}`)}
            >
              <img src={product.images[0].url} alt={product.name} />
              <div className="product-card-content">
                <h3>{product.name}</h3>
                <p className="product-price">₱{product.price}</p>
                <div className="product-rating">
                  {Array.from({ length: 5 }, (_, index) =>
                    index < product.ratings ? (
                      <StarIcon key={index} className="product-stars" style={{ color: '#FFD700' }} />
                    ) : (
                      <StarBorderIcon key={index} className="product-stars" style={{ color: '#FFD700' }} />
                    )
                  )}
                  <span className="product-numOfReviews">({product.numOfReviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
