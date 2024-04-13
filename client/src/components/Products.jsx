import { useEffect, useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import { API_URL } from "../App";

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
            <div>
                <label htmlFor="sort">Sort By:</label>
                <select id="sort" value={sortOrder} onChange={handleSortChange}>
                    <option value="default">Default</option>
                    <option value="az">Name A-Z</option>
                    <option value="za">Name Z-A</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                    <option value="sizeAsc">Size: Small to Big</option>
                    <option value="sizeDesc">Size: Big to Small</option>
                </select>
            </div>
            <input
                type="text"
                placeholder="Search..."
                value={filter}
                onChange={handleFilterChange}
            />
            {filteredAndSortedProducts.map(product => (
                <div key={product.id}>
                    <h3>
                        <Link to={`/products/${product.id}`}>{product.name}</Link>
                    </h3>
                    <p>Size: {product.size}</p>
                    <p>Price: ${product.price}</p>
                </div>
            ))}
        </div>
    );
}