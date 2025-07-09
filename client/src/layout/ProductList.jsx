import styled from "styled-components"
import { Link } from "react-router-dom"
import { data } from "../utils/data"

const ProductList = () => {
  return (
    <Grid>
      <h1>Shop Now</h1>
      {data.map((item, index) => (
        <Card key={index}>
          <img
            src={item.thumbnails?.[0]?.url}
            alt={item.thumbnails?.[0]?.alt || item.productName}
          />
          <h2>{item.productName}</h2>
          <p>${item.productPrice}</p>
          <Link to={`/product/${index}`}>View Product</Link>
        </Card>
      ))}
    </Grid>
  )
}

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
`

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
`

export default ProductList
