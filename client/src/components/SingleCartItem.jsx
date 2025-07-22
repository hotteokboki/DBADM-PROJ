import styled from "styled-components";
import { Delete } from "../icons";
import { useGlobalContext } from "../context/context";
import PropTypes from "prop-types";

const SingleCartItem = ({
  productId,
  productName,
  productPrice,
  isOnSale,
  amount,
  discountType,
  discountValue,
  images,
  // ✅ NEW - Currency conversion props
  displayPrice,
  displayCurrency,
  displayCurrencySymbol,
  convertedPrice,
  selectedCurrency,
  currencySymbol,
}) => {
  const { removeItem } = useGlobalContext();

  // ✅ UPDATED - Use converted price if available, otherwise calculate normally
  let actualPrice;

  if (displayPrice !== undefined) {
    // Use the converted price passed from FloatingCart
    actualPrice = displayPrice;
  } else {
    // Fallback to original calculation
    const validPrice = typeof productPrice === "number" ? productPrice : 0;
    actualPrice = validPrice;

    if (isOnSale) {
      if (discountType === "percentage") {
        actualPrice = validPrice * (1 - discountValue / 100);
      } else if (discountType === "fixed") {
        actualPrice = validPrice - discountValue;
      }
    }
  }

  if (typeof actualPrice !== "number" || isNaN(actualPrice)) return null;

  const totalPrice = (actualPrice * amount).toFixed(2);
  const primaryImage = images?.[0] || { url: "", alt: "Product image" };

  // ✅ UPDATED - Use currency symbol if available
  const symbol = displayCurrencySymbol || currencySymbol || "$";

  return (
    <SingleItemWrapper>
      <img src={primaryImage.url} alt={primaryImage.alt} />
      <div className="item-info">
        <p className="name">{productName}</p>
        <p className="total">
          {symbol}
          {actualPrice.toFixed(2)}&nbsp;x&nbsp;{amount}&nbsp;
          <span>
            {symbol}
            {totalPrice}
          </span>
        </p>
      </div>
      <button onClick={() => removeItem(productId)}>
        <Delete />
      </button>
    </SingleItemWrapper>
  );
};

const SingleItemWrapper = styled.li`
  display: flex;
  align-items: center;
  gap: 1.6rem;

  img {
    border-radius: 0.4rem;
    width: 5rem;
    height: 5rem;
  }

  .item-info {
    gap: 1.6rem;
    .name {
      font-size: 1.6rem;
      color: hsl(var(--dark-grayish-blue));
      margin-bottom: 0.4rem;
    }
    .total {
      font-size: 1.6rem;

      span {
        margin-left: 0.5rem;
        font-weight: 700;
      }
    }
  }

  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      opacity: 0.7;
    }
  }
`;

SingleCartItem.propTypes = {
  productId: PropTypes.number,
  productName: PropTypes.string,
  productPrice: PropTypes.number,
  amount: PropTypes.number,
  isOnSale: PropTypes.bool,
  salePercent: PropTypes.number,
  discountType: PropTypes.string,
  discountValue: PropTypes.number,
  images: PropTypes.array,
  // ✅ NEW - Currency conversion props
  displayPrice: PropTypes.number,
  displayCurrency: PropTypes.string,
  displayCurrencySymbol: PropTypes.string,
  convertedPrice: PropTypes.number,
  selectedCurrency: PropTypes.string,
  currencySymbol: PropTypes.string,
};

SingleCartItem.defaultProps = {
  productPrice: 0,
  amount: 1,
  isOnSale: false,
  salePercent: 1,
  discountType: null,
  discountValue: 0,
  images: [],
  // ✅ NEW - Currency conversion defaults
  displayPrice: undefined,
  displayCurrency: undefined,
  displayCurrencySymbol: undefined,
  convertedPrice: undefined,
  selectedCurrency: undefined,
  currencySymbol: undefined,
};

export default SingleCartItem;
