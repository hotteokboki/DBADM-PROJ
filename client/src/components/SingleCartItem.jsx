import styled from "styled-components"
import { Delete } from "../icons"
import { useGlobalContext } from "../context/context"
import PropTypes from "prop-types"

const SingleCartItem = ({
  productId,
  productName,
  productPrice,
  isOnSale,
  amount,
  discountType,
  discountValue,
  images,
}) => {
  const { removeItem } = useGlobalContext();

  const validPrice = typeof productPrice === "number" ? productPrice : 0;

  let actualPrice = validPrice;
  if (isOnSale) {
    if (discountType === "percentage") {
      actualPrice = validPrice * (1 - discountValue / 100);
    } else if (discountType === "fixed") {
      actualPrice = validPrice - discountValue;
    }
  }

  if (typeof actualPrice !== "number" || isNaN(actualPrice)) return null;

  const totalPrice = (actualPrice * amount).toFixed(2);
  const primaryImage = images?.[0] || { url: "", alt: "Product image" };

  return (
    <SingleItemWrapper>
      <img src={primaryImage.url} alt={primaryImage.alt} />
      <div className="item-info">
        <p className="name">{productName}</p>
        <p className="total">
          ${actualPrice.toFixed(2)}&nbsp;x&nbsp;{amount}&nbsp;
          <span>${totalPrice}</span>
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
`

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
};

SingleCartItem.defaultProps = {
  productPrice: 0,
  amount: 1,
  isOnSale: false,
  salePercent: 1,
  discountType: null,
  discountValue: 0,
  images: [],
};

// productId: 1,
// companyName: "Sneaker Company",
// productName: "Fall Limited Edition Sneakers",
// productDescription:
//   "These low-profile sneakers are your perfect casual wear companion. Featuring a durable rubber outer sole, they’ll withstand everything the weather can offer.",
// productPrice: 250,
// isOnSale: true,
// salePercent: 0.5,
// amount: 0,
// images: productImages,

export default SingleCartItem
