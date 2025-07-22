import styled from "styled-components"
import PropTypes from "prop-types"
import ProductControls from "./ProductControls"

const ProductInfo = ({
  productId,
  companyName,
  productName,
  productDescription,
  productPrice,
  isOnSale,
  discountType,
  discountValue,
  daysLeft,
  productImages,
  stock,
}) => {
  return (
    <InfoWrapper>
      <div className="inner-info">
        <h2 className="company-name">{companyName}</h2>
        <p className="product-name">{productName}</p>
        <p className="product-description">
          {productDescription.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <div className="pricing">
          <p className="price">${Number(productPrice).toFixed(2)}</p>

          {isOnSale && discountType && discountValue && (
            <>
              <p className="percent">
                {discountType === "percentage"
                  ? `${Number(discountValue).toFixed(0)}%`
                  : `-$${Number(discountValue).toFixed(2)}`}
              </p>

              <p className="original-price">
                ${discountType === "percentage"
                  ? (productPrice / (1 - discountValue / 100)).toFixed(2)
                  : (productPrice + Number(discountValue)).toFixed(2)}
              </p>

              {daysLeft > 0 && (
                <p className="sale-ends">
                  Sale ends in {daysLeft} day{daysLeft > 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
        </div>
        {typeof stock === "number" && (
          <p className={`stock-info ${
            stock === 0 ? "out" : stock < 10 ? "low" : "ok"
          }`}>
            {stock === 0
              ? "Out of stock"
              : stock < 10
              ? `Only ${stock} left in stock!`
              : `In stock: ${stock} item${stock > 1 ? "s" : ""}`}
          </p>
        )}
      </div>
      <ProductControls
        productId={productId}
        productName={productName}
        productPrice={productPrice}
        isOnSale={isOnSale}
        discountType={discountType}
        discountValue={discountValue}
        images={productImages}
        stock={stock}
      />
    </InfoWrapper>
  );
};

const InfoWrapper = styled.section`
  padding: 2.4rem;

  @media screen and (min-width: 600px) {
    padding: 2.4rem 4rem;
  }

  @media screen and (min-width: 768px) {
    margin: 0 auto;
  }

  .inner-info {
    margin-bottom: 1.6rem;

    .company-name {
      font-size: 1.2rem;
      color: hsl(var(--orange));
      margin-bottom: 2rem;
    }

    .product-name {
      font-size: 2.8rem;
      font-weight: 700;
      margin-bottom: 1.5rem;
    }

    /* 👇 Use this class with a <ul> */
    .product-description {
      font-size: 1.5rem;
      color: hsl(var(--dark-grayish-blue));
      list-style-type: disc;
      padding-left: 1.5rem;
      margin-top: 1rem;
      margin-bottom: 2.4rem;
      line-height: 2.5rem;

      li {
        margin-bottom: 0.75rem;
      }
    }

    .stock-info {
      font-size: 1.4rem;
      font-weight: 500;
      margin-top: 1.6rem;

      &.low {
        color: hsl(var(--red)); /* Replace with a red variable or fallback */
      }

      &.ok {
        color: hsl(var(--dark-grayish-blue));
      }
    }

    .pricing {
      display: grid;
      grid-template-columns: auto auto 1fr;
      grid-template-rows: auto auto;
      gap: 0.8rem 1.6rem;
      align-items: center;

      .price {
        font-size: 2.8rem;
        font-weight: 700;
        grid-column: 1 / 2;
        grid-row: 1 / 2;
      }

      .percent {
        font-size: 1.6rem;
        font-weight: 700;
        color: hsl(var(--orange));
        background-color: hsl(var(--pale-orange));
        padding: 0.6rem 1rem;
        border-radius: 0.6rem;
        grid-column: 2 / 3;
        grid-row: 1 / 2;
      }

      .original-price {
        font-size: 1.6rem;
        font-weight: 700;
        color: hsl(var(--grayish-blue));
        text-decoration: line-through;
        justify-self: end;
        grid-column: 3 / 4;
        grid-row: 1 / 2;
      }

      .sale-ends {
        font-size: 1.4rem;
        font-weight: 500;
        color: hsl(var(--dark-grayish-blue));
        grid-column: 1 / 4;
        grid-row: 2 / 3;
      }
    }
  }

  @media screen and (min-width: 1000px) {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0;
    flex-basis: 44.5rem;

    .inner-info {
      .company-name {
        font-size: 1.3rem;
        line-height: 1.6rem;
        margin-bottom: 2.4rem;
      }

      .product-name {
        font-size: 4.4rem;
        line-height: 4.8rem;
        margin-bottom: 3.2rem;
      }

      .product-description {
        font-size: 1.6rem;
        line-height: 2.6rem;
      }

      .pricing {
        display: grid;
        grid-template-columns: auto auto 1fr;
        grid-template-rows: auto auto;
        gap: 0.8rem 1.6rem;

        .price {
          grid-column: 1 / 2;
          grid-row: 1 / 2;
        }

        .percent {
          grid-column: 2 / 3;
          grid-row: 1 / 2;
        }

        .original-price {
          grid-column: 1 / 2;
          grid-row: 2;
          justify-self: start;
        }

        .sale-ends {
          grid-column: 1 / 4;
          grid-row: 1;
          justify-self: end;
        }
      }
    }
  }
`

ProductInfo.propTypes = {
  companyName: PropTypes.string,
  productName: PropTypes.string,
  productDescription: PropTypes.string,
  productPrice: PropTypes.number,
  isOnSale: PropTypes.bool,
  salePercent: PropTypes.number,
}

ProductInfo.defaultProps = {
  companyName: "N/A",
  productName: "N/A",
  productDescription: "No description available.",
  productPrice: 0,
  isOnSale: false,
  salePercent: 0,
}

export default ProductInfo
