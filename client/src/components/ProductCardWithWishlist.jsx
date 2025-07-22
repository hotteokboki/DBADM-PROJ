import { Link } from "react-router-dom";
import styled from "styled-components";
import PropTypes from "prop-types";

const ProductCardWithWishlist = ({ product }) => {
  let images = [];

  try {
    images = Array.isArray(product.image_url)
      ? product.image_url
      : JSON.parse(product.image_url || "[]");
  } catch (e) {
    console.error("Image parsing error:", e);
  }

  const thumbnail = images[0] || "";

  return (
    <Card>
      <img src={thumbnail} alt={product.product_name} />
      <h2>{product.product_name}</h2>
      <p>${product.price}</p>

      {product.stock_quantity === 0 ? (
        <Link to={`/wishlist/product/${product.product_id}`}>
          Join Waitlist
        </Link>
      ) : (
        <Link to={`/product/${product.product_id}`}>Buy Now</Link>
      )}
    </Card>
  );
};

ProductCardWithWishlist.propTypes = {
  product: PropTypes.object.isRequired,
};

const Card = styled.article`
  border: 1px solid #ccc;
  padding: 1rem;
  text-align: center;
  background: #fff;

  img {
    max-width: 100%;
    object-fit: cover;
    height: 200px;
  }

  h2 {
    font-size: 1.25rem;
    margin-top: 1rem;
  }

  p {
    color: #888;
  }

  a {
    margin-top: 1rem;
    display: inline-block;
    background: #000;
    color: white;
    padding: 0.5rem 1rem;
    text-decoration: none;
    border-radius: 5px;
  }
`;

export default ProductCardWithWishlist;