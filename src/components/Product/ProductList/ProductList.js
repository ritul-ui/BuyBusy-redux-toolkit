import React from "react";
import ProductCard from "../ProductCard/ProductCard";
import ProductGrid from "../ProductGrid/ProductGrid";

const ProductList = ({ products, style, onCart }) => {
  // Component to display the product list
    // const safeProducts = Array.isArray(products) ? products : [];
  return (
    <ProductGrid style={{ ...style }}>
      {products.map((product, idx) => {
        return <ProductCard product={product} key={idx} onCart={onCart} />;
      })}
    </ProductGrid>
  );
};

export default ProductList;
