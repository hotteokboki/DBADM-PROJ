import styled from "styled-components"
import PropTypes from "prop-types"
import { Plus, Minus, Cart } from "../icons/index"
import Button from "./Button"
import { useGlobalContext } from "../context/context"
import axios from "axios";

const ProductControls = ({
  productId,
  productName,
  productPrice,
  isOnSale,
  discountType,
  discountValue,
  images,
  stock,
  isInWishlist
}) => {
  const { increaseAmount, decreaseAmount, addToCart, state, showSnackbar } = useGlobalContext()

  const handleAddToCart = async () => {
    const amount = state.amounts?.[productId] || 1;

    const item = {
      productId,
      productName,
      productPrice,
      isOnSale,
      discountType,
      discountValue,
      images,
    };

    addToCart(amount, item);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/cart/add-to-cart`,
        {
          productId,
          quantity: amount,
          priceAtAddition: productPrice,
        },
        {
          withCredentials: true, // important to send session cookie
        }
      );

      if (!response.data.success) {
        throw new Error("Add to cart failed");
      } else {
        showSnackbar("Item added to cart!", "success");
      }
    } catch (error) {
      console.error("Cart save error:", error);
    }
  };

  return (
    <ControlsWrapper>
      {stock === 0 ? (
        isInWishlist ? (
          <Button
            className="wishlist"
            func={() => {
              window.location.href = "/wishlist";
            }}
          >
            View Item in Wishlist
          </Button>
        ) : (
          <Button
            className="wishlist"
            func={async () => {
              try {
                const response = await axios.post(
                  `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/wishlist/add`,
                  { productId },
                  { withCredentials: true }
                );

                if (!response.data.success) {
                  throw new Error("Add to wishlist failed");
                }

                showSnackbar("Item added to wishlist!", "success");
                // Optional: update local isInWishlist state if needed
              } catch (error) {
                console.error("Wishlist add error:", error);
                showSnackbar("Failed to add to wishlist", "error");
              }
            }}
          >
            Add to Wishlist
          </Button>
        )
      ) : (
        <>
          <div className="inner-controls">
            <button onClick={() => decreaseAmount(productId)}>
              <Minus />
            </button>
            <span className="amount">{state.amounts?.[productId] || 1}</span>
            <button onClick={() => increaseAmount(productId)}>
              <Plus />
            </button>
          </div>
          <Button className="cart" func={handleAddToCart} color="#FFFFFF">
            <Cart />
            Add to Cart
          </Button>
        </>
      )}
    </ControlsWrapper>
  )
}

ProductControls.propTypes = {
  productId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  productPrice: PropTypes.number.isRequired,
}

const ControlsWrapper = styled.div`
  .inner-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: hsl(var(--light-grayish-blue));
    padding: 2.2rem 2.4rem;
    border-radius: 1rem;
    margin-bottom: 2.4rem;

    .amount {
      font-size: 1.6rem;
      font-weight: 700;
      line-height: 2rem;
    }
  }

  .wishlist {
    padding: 1.6rem;
    background-color: hsl(0, 0%, 90%);
    color: hsla(37, 85%, 55%, 0.95);
    font-weight: 600;
    text-align: center;
    border-radius: 1rem;
    border: 2px dashed hsla(37, 85%, 55%, 0.95);
    font-size: 1.6rem;
    width: 100%; /* Ensure full width like .cart */
  }

  @media only screen and (min-width: 1000px) {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    align-items: center;
    gap: 1.6rem;

    .inner-controls {
      margin-bottom: 0;
      grid-column: 1 / 3;
    }

    .cart {
      grid-column: 3 / 6;
    }

    .wishlist {
      grid-column: 1 / 6;
    }
  }
`

export default ProductControls