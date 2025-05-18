// Implement your code for cart reducer
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {db} from "../../config/firebase";
import {doc, getDoc, updateDoc, setDoc, arrayUnion} from "firebase/firestore";
import {toast} from "react-toastify";
import { getProductsUsingProductIds , getUserCartProducts} from "../../utils/utils";

const initialState = {
    cartProducts : [],
    cartProductsMap : {},
    purchasing : false,
    loading: false,
}


export const fetchCartProducts = createAsyncThunk("cart/fetch", async ({uid}) => {
    const {data} = await getUserCartProducts(uid);
    const {myCart : cart} = data;
    const productsData = await getProductsUsingProductIds(cart);
    console.log("productsData", productsData);
    if(!productsData){
        toast.error("No products in cart!");
        return productsData;
    }
    return {cart, productsData};
})

//remove product from the database

export const removeProductFromCart = createAsyncThunk("cart/remove", async({productId, uid}) => {
    const {data, docRef} = await getUserCartProducts(uid);
    const {myCart : cart} = data;
    if(!cart[productId]){
        toast.error("Product not in cart!");
        return;
    } 
    delete cart[productId];

    await updateDoc(docRef, {
        myCart : {
            ...cart
        }
    })
    return {productId}
})

export const purchaseProducts = createAsyncThunk("cart/purchase", async({uid}, {getState}) => {
    const state = getState();
    const docRef = doc(db, "userOrders", uid);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    //If users orders exist add a new order to the orders list
    if(data){
        console.log("state", state);
        return await updateDoc(docRef, {
            orders : arrayUnion({...state.cart.cartProductsMap, date : Date.now()}) //ask to abhijeet about arrayUnion

        })
    }
    //create a new orders array if no orders yet
    return await setDoc(docRef, {
        orders : [{...state.cart.cartProductsMap, date : Date.now()}]
    }) 

})

export  const clearUserCart = createAsyncThunk("cart/clear", async ({uid}) => {
    const userCartRef = doc(db, "usersCarts", uid);
    return await updateDoc(userCartRef, {
        myCart : {}
    })
})

//remove product from cart and cart producsts list

const deleteProductFromCart = (state, action) => {
    const {productId} = action.payload;
    delete state.cartProductsMap[productId]; //how delete works
    state.cartProducts = state.cartProducts.filter((product) => {
        return product.id !== productId;
    })
}

const cartSlice = createSlice({
    name : "cart",
    initialState,
    reducers : {
        updateProductQuantity(state, action){
            console.log("action", action);
            const {id, type} = action.payload;
            let tempCart = state.cartProducts.map((product) => {
                if(product.id === id){
                    product.quantity = product.quantity + (type === "add" ? 1 : -1); //
                }
                console.log("product cart", product);
                return product;
            })
            state.cartProductsMap[id] = state.cartProductsMap[id] + (type === "add" ? 1 : -1); //
            state.cartProducts = tempCart;
        },
        filterProductFromCart : deleteProductFromCart
    },
    extraReducers :  (builder) => {
        builder.addCase(fetchCartProducts.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchCartProducts.fulfilled, (state, action) => {
            state.loading = false;
            const {cart, productsData} = action.payload;
            state.cartProductsMap = cart;
            state.cartProducts = productsData;
        })
        .addCase(clearUserCart.fulfilled, (state) => {
            state.cartProducts = [];
            state.cartProductsMap = {};
        })
        .addCase(removeProductFromCart.fulfilled, (state, action) => {
            deleteProductFromCart(state,action);
            toast.success("Product Removed Successfully!");
        })
        .addCase(purchaseProducts.pending, (state) => {
            state.purchasing = true;
        })
        .addCase(purchaseProducts.fulfilled, (state) => {
            state.purchasing = false;
        })
        .addCase(purchaseProducts.rejected, (state) => {
            state.purchasing= false;
        })
    }
})

export const getCartLoadingState = (state) => state.cart.loading;
export const getCartProducts = (state) => state.cart.cartProducts;
export const getCartProductsMap = (state) => state.cart.cartProductsMap;
export const getPurchasingState = (state) => state.cart.purchasing;

export const {updateProductQuantity, filterProductFromCart} =  cartSlice.actions;
export default cartSlice.reducer;
