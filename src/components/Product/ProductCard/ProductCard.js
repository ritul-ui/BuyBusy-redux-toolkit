import React from "react";
import ProductContainer from "../ProductContainer/ProductContainer";
import ProductDetails from "../ProductContainer/ProductDetails/ProductDetails";
import ProductImage from "../ProductContainer/ProductImage/ProductImage";

// Product Card component
const ProductCard = ({
  product: { title, price, image, id, quantity },
  onOwnPage,
  onCart,
}) => {
  console.log("ProductCard", { title, price, image, id, quantity });
  console.log("ProductCard quantity", quantity);
  return (
    <ProductContainer>
      <ProductImage image={image} />
      <ProductDetails
        title={title}
        price={price}
        onOwnPage={onOwnPage}
        productId={id}
        onCart={onCart}
        quantity={quantity}
      />
    </ProductContainer>
  );
};

export default ProductCard;
