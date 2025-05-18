import React, { useState } from "react";
import styles from "./ProductDetails.module.css";
import { toast } from "react-toastify";
import {updateDoc, setDoc} from "firebase/firestore";

import { useNavigate } from "react-router-dom";
import MinusIcon from "../../../UI/Icons/MinusIcon";
import PlusIcon from "../../../UI/Icons/PlusIcon";
import { getUserCartProducts } from "../../../../utils/utils";
import { useSelector, useDispatch } from "react-redux";
import { filterProductFromCart, removeProductFromCart, updateProductQuantity } from "../../../../redux/reducers/cartReducer";
import { getUser } from "../../../../redux/reducers/authReducer";

const ProductDetails = ({ title, price, productId, onCart, quantity }) => {
  const [productAddingToCart, setProductAddingToCart] = useState(false);
  const [productRemovingFromCart, setProductRemovingCart] = useState(false);

  const navigate = useNavigate();

  const dispatch = useDispatch();
   const user = useSelector(getUser);



  const addProductToCart = async () => {
      // Function to add product to cart
      setProductAddingToCart(true);
      if(!user){
        return navigate("/signin");
      }
      try{
        const {data, docRef} = await getUserCartProducts(user.uid);
        if(data && data.myCart[productId]){
          const {myCart: cart} = data;
          console.log("add to cart", cart);
          const currentProductCount =cart[productId];
          const updatedCart = {
            ...cart,
            [productId] : currentProductCount + 1
          };
          updateDoc(docRef, {
            myCart: updatedCart
          })
          return toast.success("increase product count");
        }

        const cart = data?.myCart || {};
        await setDoc(docRef, {
          myCart: {...cart, [productId] : 1}
        })
        toast.success("product added succesfully")
      }catch(error){
        console.log(error);
        toast.error(error.message);
      }finally{
        setProductAddingToCart(false);
      }
  };
  const removeProduct = async () => {
    // Function to remaove the cart
    setProductRemovingCart(true);
    await dispatch(removeProductFromCart({productId, uid : user.uid}));
    setProductRemovingCart(false);
  };


  const handleAdd = async () => {
  // Function for Handling the product quantity increase
  try{
    const {data, docRef} = await getUserCartProducts(user.uid);
    const {myCart: cart} = data;
    console.log("cart", cart);
    if(cart && cart[productId]){
      const currentProductCount = cart[productId];
      const updatedCart = {
        ...cart,
        [productId] : currentProductCount + 1
      }
      await updateDoc(docRef, {
        myCart : updatedCart
      })
      dispatch(updateProductQuantity({type: "add", id: productId}));
      return;
    }
  }catch(error){
    console.log(error);
    toast.error(error.message);
  }
  };

  const handleRemove = async () => {
  // Handling the product quantity decrease
  try{
    const {data, docRef} = await getUserCartProducts(user.uid);
    const {myCart: cart} = data;
    if(cart && cart[productId]){
      const productCountAfterRemove = cart[productId] - 1;
      const updatedCart ={
        ...cart,
        [productId] : productCountAfterRemove
      }
      if(productCountAfterRemove === 0) delete updatedCart[productId];
      await updateDoc(docRef, {myCart: updatedCart});
      if(productCountAfterRemove === 0){
        return dispatch(filterProductFromCart({productId}));
      }
      dispatch(updateProductQuantity({type: "remove", id: productId}));
      return;
    }

  }catch(error){
    console.log(error);
    toast.error(error.message);
  }
  };

  return (
    <div className={styles.productDetails}>
      <div className={styles.productName}>
        <p>{`${title.slice(0, 35)}...`}</p>
      </div>
      <div className={styles.productOptions}>
        <p>₹ {price}</p>
        {onCart && (
          <div className={styles.quantityContainer}>
            <MinusIcon handleRemove={handleRemove} />
            {quantity}
            <PlusIcon handleAdd={handleAdd} />
          </div>
        )}
      </div>
      {/* Conditionally Rendering buttons based on the screen */}
      {!onCart ? (
        <button
          className={styles.addBtn}
          title="Add to Cart"
          disabled={productAddingToCart}
          onClick={addProductToCart}
        >
          {productAddingToCart ? "Adding" : "Add To Cart"}
        </button>
      ) : (
        <button
          className={styles.removeBtn}
          title="Remove from Cart"
          onClick={removeProduct}
        >
          {productRemovingFromCart ? "Removing" : "Remove From Cart"}
        </button>
      )}
    </div>
  );
};

export default ProductDetails;
