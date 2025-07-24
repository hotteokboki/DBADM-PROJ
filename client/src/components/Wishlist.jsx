import styled from "styled-components";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/wishlist/get-wishlist`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.success) {
          setWishlistItems(res.data.wishlist);
        }
      })
      .catch((err) => console.error("Error fetching wishlist:", err));
  }, []);

  return (
    <Grid>
      <h1>Your Wishlist</h1>
      {wishlistItems.map((item) => {
        let images = [];

        try {
          images = Array.isArray(item.image_url)
            ? item.image_url
            : JSON.parse(item.image_url || "[]");
        } catch (e) {
          console.error("Error parsing image_url:", item.image_url, e);
        }

        const thumbnail = images[0] || "/fallback.jpg";

        return (
          <Card key={item.product_id}>
            <img src={thumbnail} alt={item.product_name} />
            <h2>{item.product_name}</h2>
            <p>${Number(item.price).toFixed(2)}</p>
            <Link to={`/product/${item.product_id}`} state={{ isWishlist: true }}>
              View Item
            </Link>
          </Card>
        );
      })}
    </Grid>
  );
};

const Grid = styled.section`
  max-width: 111rem;
  margin: 4rem auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  padding: 2rem;

  h1 {
    grid-column: 1 / -1;
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }
`;

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

export default Wishlist;