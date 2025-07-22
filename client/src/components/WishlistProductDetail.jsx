import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";

const WishlistProductDetail = () => {
  const { id } = useParams(); // product_id
  const [product, setProduct] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/wishlist/${id}`)
      .then((res) => {
        const item = res.data.wishlist?.[0];
        setProduct(item);
      })
      .catch((err) => console.error("Error loading product:", err));
  }, [id]);

  const handleJoinWaitlist = () => {
    setJoining(true);
    axios
      .post(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/waitlist/join`,
        { product_id: id },
        { withCredentials: true }
      )
      .then(() => setJoined(true))
      .catch((err) => console.error("Error joining waitlist:", err))
      .finally(() => setJoining(false));
  };

  if (!product) return <p>Loading product...</p>;

  let images = [];
  try {
    images = Array.isArray(product.image_url)
      ? product.image_url
      : JSON.parse(product.image_url || "[]");
  } catch (e) {
    console.error("Image parsing error:", e);
  }

  const isOnSale = product.discount_type && product.discount_value > 0;
  const today = new Date();
  const endDate = new Date(product.discount_end);
  const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)));

  return (
    <InfoWrapper>
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>
      {images.length > 0 && (
        <img className="product-image" src={images[0].url || images[0]} alt={product.product_name} />
      )}
      <div className="inner-info">
        <h2 className="company-name">{product.company_name}</h2>
        <p className="product-name">{product.product_name}</p>
        <p className="product-description">
          {product.product_description?.split("\n").map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </p>
        <div className="pricing">
          <p className="price">${Number(product.price).toFixed(2)}</p>

          {isOnSale && (
            <>
              <p className="percent">
                {product.discount_type === "percentage"
                  ? `${Number(product.discount_value).toFixed(0)}%`
                  : `-$${Number(product.discount_value).toFixed(2)}`}
              </p>

              <p className="original-price">
                $
                {product.discount_type === "percentage"
                  ? (product.price / (1 - product.discount_value / 100)).toFixed(2)
                  : (product.price + Number(product.discount_value)).toFixed(2)}
              </p>

              {daysLeft > 0 && (
                <p className="sale-ends">
                  Sale ends in {daysLeft} day{daysLeft > 1 ? "s" : ""}
                </p>
              )}
            </>
          )}
        </div>

        {typeof product.stock_quantity === "number" && (
          <p className={`stock-info ${product.stock_quantity === 0 ? "out" : product.stock_quantity < 10 ? "low" : "ok"
            }`}>
            {product.stock_quantity === 0
              ? "Out of stock"
              : product.stock_quantity < 10
                ? `Only ${product.stock_quantity} left in stock!`
                : `In stock: ${product.stock_quantity} item${product.stock_quantity > 1 ? "s" : ""}`}
          </p>
        )}

        {product.stock_quantity === 0 ? (
          <button onClick={handleJoinWaitlist} disabled={joining || joined}>
            {joined ? "You've joined the waitlist" : "Join Waitlist"}
          </button>
        ) : (
          <p className="restocked-msg">
            Item is now in stock! <a href={`/product/${id}`}>View Product</a>
          </p>
        )}
      </div>
    </InfoWrapper>
  );
};

const InfoWrapper = styled.section`
  padding: 2.4rem;

  .back-button {
    background: none;
    border: none;
    font-size: 1.4rem;
    margin-bottom: 1.6rem;
    cursor: pointer;
    color: hsl(var(--orange));
    font-weight: bold;

    &:hover {
      text-decoration: underline;
    }
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

    .product-description {
      font-size: 1.5rem;
      color: hsl(var(--dark-grayish-blue));
      padding-left: 1.5rem;
      margin-bottom: 2.4rem;
      line-height: 2.5rem;
    }

    .pricing {
      display: grid;
      grid-template-columns: auto auto 1fr;
      grid-template-rows: auto auto;
      gap: 0.8rem 1.6rem;

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

    .stock-info {
      font-size: 1.4rem;
      font-weight: 500;
      margin-top: 1.6rem;

      &.low {
        color: hsl(var(--red));
      }

      &.ok {
        color: hsl(var(--dark-grayish-blue));
      }
    }

    button {
      margin-top: 2rem;
      background: hsl(var(--orange));
      color: white;
      padding: 1rem 2rem;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1rem;
    }

    button:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .restocked-msg {
      margin-top: 2rem;
      font-size: 1.2rem;

      a {
        color: hsl(var(--orange));
        font-weight: bold;
        text-decoration: none;
      }
    }
  }
`;

export default WishlistProductDetail;