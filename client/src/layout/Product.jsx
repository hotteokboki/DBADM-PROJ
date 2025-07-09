import styled from "styled-components"
import ImageCarousel from "../components/ImageCarousel"
import ImageOverlay from "../components/ImageOverlay"
import ProductInfo from "../components/ProductInfo"
import { productImages, productThumbnails } from "../assets/imagedata"
import { useParams } from "react-router-dom"
import { data } from "../utils/data"

const Product = () => {
  const { id } = useParams()
  const product = data[id]

  if (!product) {
    return <h1>Product not found</h1>
  }

  return (
    <ProductWrapper>
      <ImageCarousel
        productImages={product.images}
        productThumbnails={product.thumbnails}
      />
      <ProductInfo {...product} />
    </ProductWrapper>
  )
}

const ProductWrapper = styled.article`
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media only screen and (min-width: 768px) {
    margin-top: 5rem;
  }

  @media only screen and (min-width: 1000px) {
    margin-top: 9rem;
    gap: 5rem;
    display: grid;
    grid-template-columns: 44.5rem 44.5rem;
  }

  @media only screen and (min-width: 1200px) {
    gap: 11rem;
  }
`

export default Product