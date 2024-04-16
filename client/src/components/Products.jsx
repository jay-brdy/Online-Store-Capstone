import { useEffect, useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import { API_URL } from "../App";
import SearchIcon from '@mui/icons-material/Search';
import { InputAdornment, TextField, Select, MenuItem, InputLabel, FormControl } from '@mui/material';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("");
    const [sortOrder, setSortOrder] = useState("default");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_URL}/api/products`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
                setLoading(false);
            } catch (error) {
                setError(error.message || 'An error occurred while fetching products');
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // using useMemo to memorize the refult of filtering and sorting if both are utilized
    const filteredAndSortedProducts = useMemo(() => {
        let filtered = [...products];

        // Filter products based on the filter/search criteria
        // Filter not case sensitive
        if (filter) {
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(filter.toLowerCase()) ||
                product.description.toLowerCase().includes(filter.toLowerCase())
            );
        }

        // Sort filtered products based on sort by order
        if (sortOrder === "az") {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortOrder === "za") {
            filtered.sort((a, b) => b.name.localeCompare(a.name));
        } else if (sortOrder === "priceAsc") {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortOrder === "priceDesc") {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortOrder === "sizeAsc") {
            filtered.sort((a, b) => a.size - b.size);
        } else if (sortOrder === "sizeDesc") {
            filtered.sort((a, b) => b.size - a.size);
        }

        return filtered;
    }, [products, filter, sortOrder]);

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleSortChange = (event) => {
        setSortOrder(event.target.value);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h2>Products</h2>

            {/* <input
                type="text"
                placeholder="Search..."
                value={filter}
                onChange={handleFilterChange}
                using MUI instead below
            /> */}

            <div className="search-and-sort">
                <TextField
                    placeholder="Search..."
                    value={filter}
                    onChange={handleFilterChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* <label htmlFor="sort">Sort By:</label>
                <select id="sort" value={sortOrder} onChange={handleSortChange}>
                    <option value="default">Default</option>
                    <option value="az">Name A-Z</option>
                    <option value="za">Name Z-A</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="sizeAsc">Size: Small to Big</option>
                    <option value="sizeDesc">Size: Big to Small</option>
                </select> 
                using MUI instead below
                */}
                <FormControl>
                    <InputLabel id="sort-label">Sort By:</InputLabel>
                    <Select
                        labelId="sort-label"
                        id="sort"
                        value={sortOrder}
                        onChange={handleSortChange}
                    >
                        <MenuItem value="default">Default</MenuItem>
                        <MenuItem value="az">Name A-Z</MenuItem>
                        <MenuItem value="za">Name Z-A</MenuItem>
                        <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                        <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                        <MenuItem value="sizeAsc">Size: Small to Big</MenuItem>
                        <MenuItem value="sizeDesc">Size: Big to Small</MenuItem>
                    </Select>
                </FormControl>
            </div>

            <div className="products-grid">
                {filteredAndSortedProducts.map(product => (
                    <div id="product-item" key={product.id}>
                        <Link to={`/products/${product.id}`}>
                            <img src={product.imageurl} alt={product.name} className="product-image" />
                        </Link>
                        <div className="product-details">
                            <h3 className="product-name">
                                <Link to={`/products/${product.id}`}>{product.name}</Link>
                            </h3>
                            <p>${product.price}</p>
                            <p>Size: {product.size}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}