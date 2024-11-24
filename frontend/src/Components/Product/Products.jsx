import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Box from "@mui/material/Box";
import { Breadcrumbs, Link, Typography, Slider } from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import Toast from "../Layout/Toast";
import Swal from "sweetalert2";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true); // Track if more data is available
  const [sortOrder, setSortOrder] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(10); // Number of products to show initially
  const itemsPerPage = 10; // Number of products to load per scroll
  const navigate = useNavigate();

  useEffect(() => {
    Swal.fire({
      title: "Loading products...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(
          `${import.meta.env.VITE_API}/products`,
          { headers }
        );
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

  const sortProducts = (products, order) => {
    let sortedProducts = [...products];
    switch (order) {
      case "low-to-high":
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case "high-to-low":
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case "a-z":
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "z-a":
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }
    return sortedProducts;
  };

  const handleSortChange = (event) => setSortOrder(event.target.value);

  const handleCategoryChange = (event) => {
    const { value, checked } = event.target;
    setSelectedCategories((prev) =>
      checked ? [...prev, value] : prev.filter((category) => category !== value)
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch =
        selectedCategories.length === 0 ||
        selectedCategories.includes(product.category);
      const ratingMatch =
        ratingFilter === null || product.ratings === ratingFilter;
      return categoryMatch && ratingMatch;
    });
  }, [products, selectedCategories, ratingFilter]);

  const sortedAndFilteredProducts = useMemo(
    () => sortProducts(filteredProducts, sortOrder),
    [filteredProducts, sortOrder]
  );

  const paginatedProducts = sortedAndFilteredProducts.slice(
    0,
    visibleProducts
  );

  const fetchMoreProducts = () => {
    if (visibleProducts >= sortedAndFilteredProducts.length) {
      setHasMore(false); // No more products to load
      return;
    }
    setTimeout(() => {
      setVisibleProducts((prev) => prev + itemsPerPage);
    }, 1000); // Simulate API delay
  };

  if (loading) return <p>Loading...</p>;

  return (
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
          <input
            type="checkbox"
            id="pasta"
            name="category"
            value="Pasta"
            onChange={handleCategoryChange}
          />
          <label htmlFor="pasta">Pasta</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="rice"
            name="category"
            value="Rice Meal"
            onChange={handleCategoryChange}
          />
          <label htmlFor="rice">Rice Meal</label>
        </div>
        <div>
          <input
            type="checkbox"
            id="sandwich"
            name="category"
            value="Sandwich"
            onChange={handleCategoryChange}
          />
          <label htmlFor="sandwich">Sandwich</label>
        </div>

        <h5>Ratings</h5>
        <Box sx={{ width: 200 }}>
          <Slider
            size="small"
            min={-1}
            max={5}
            step={1}
            value={ratingFilter === null ? -1 : ratingFilter}
            onChange={(event, newValue) =>
              setRatingFilter(newValue === -1 ? null : newValue)
            }
            aria-label="Rating Filter"
            valueLabelDisplay="off"
          />
          <Typography variant="caption">
            {ratingFilter === null
              ? "All Products"
              : `Rating: ${ratingFilter}`}
          </Typography>
        </Box>
      </div>

      <div className="product-list-container">
        <InfiniteScroll
          dataLength={paginatedProducts.length} // Current number of loaded products
          next={fetchMoreProducts} // Function to fetch more data
          hasMore={hasMore} // Whether there are more products to load
          loader={<p>Loading more products...</p>} // Loader message
          endMessage={
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              <b>No more products to load</b>
            </p>
          }
        >
          <div className="products-container">
            {paginatedProducts.map((product) => (
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
                        <StarIcon key={index} style={{ color: "#FFD700" }} />
                      ) : (
                        <StarBorderIcon
                          key={index}
                          style={{ color: "#FFD700" }}
                        />
                      )
                    )}
                    <span className="product-numOfReviews">
                      ({product.numOfReviews})
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default Products;
