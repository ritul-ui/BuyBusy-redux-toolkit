import React, { useEffect, useState } from "react";
import styles from "./HomePage.module.css";
import Loader from "../../components/UI/Loader/Loader";
import ProductList from "../../components/Product/ProductList/ProductList";
import FilterSidebar from "../../components/FilterSidebar/FilterSidebar";
import { getAllProducts, getProducts, getFilteredProducts, getLoadingState, filterProducts } from "../../redux/reducers/productsReducer";
import { useDispatch, useSelector } from "react-redux";
import { addDataToCollection } from "../../utils/utils";


function HomePage() {
  const [query, setQuery] = useState("");
  const [priceRange, setPriceRange] = useState(75000);
  const [categories, setCategories] = useState({
    mensFashion: false,
    electronics: false,
    jewelery: false,
    womensClothing: false,
  });

  const dispatch = useDispatch();

  const products = useSelector(getProducts);
  console.log("products", products);
  const filteredProducts = useSelector(getFilteredProducts);
  console.log("filteredProducts", filteredProducts);
  const loading = useSelector(getLoadingState);
  // Fetch products on app mount
  useEffect(() => {
    dispatch(getAllProducts());
    addDataToCollection();
  }, [])

  // Rerender the products if the search or filter parameters change
  useEffect(() => {
    dispatch(
      filterProducts({
        searchQuery: query,
        priceRange,
        categories,
      })
    );
  }, [query, priceRange, categories]);

  // Display loader while products are fetching using the Loader Component
  if(loading){
    return <Loader />
  }

   const style = {
    margin: "10px 0",
    padding: "10px",
    background: "#f9f9f9"
  };

    const onCart = (productId, action) => {
    // action: "add" or "remove"
    // productId: the id of the product to add/remove
    // Implement your logic here, e.g., dispatch an action or update state
    console.log(`Cart action: ${action} for product id: ${productId}`);
  };

  return (
    <div className={styles.homePageContainer}>
      <FilterSidebar
        setPriceRange={setPriceRange}
        setCategories={setCategories}
        priceRange={priceRange}
      />
      <form className={styles.form}>
        <input
          type="search"
          placeholder="Search By Name"
          className={styles.searchInput}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
      
      {products.length ? (
        <ProductList  products={products.length ? filteredProducts : []}   />
      ) : null}
    </div>
  );
}

export default HomePage;
