import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import ProductInfo from "../components/ProductInfo"
import ImageCarousel from "../components/ImageCarousel"
import styled from "styled-components"

const Product = () => {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/products/product-information/${id}`
        )
        const productData = res.data.products?.[0]

        if (productData) {
          // Parse image_url safely
          let imageArray = []
          try {
            imageArray = JSON.parse(productData.image_url || "[]")
          } catch (e) {
            console.warn("Invalid JSON in image_url", e)
          }

          // Calculate days left before formatting
          let daysLeft = null;
          if (
            productData.is_onSale === 1 || productData.is_onSale === "1"
          ) {
            const now = new Date();
            const endDate = new Date(productData.end_date);
            const timeDiff = endDate - now;
            daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
          }

          // Prepare formatted product object
          const formattedProduct = {
            productId: productData.product_id,
            companyName: "Florecien Technologies Inc",
            productName: productData.product_name,
            productDescription: productData.product_description,
            productPrice: parseFloat(productData.price),
            isOnSale: productData.is_onSale === 1 || productData.is_onSale === "1",
            discountType: productData.discount_type,
            discountValue: parseFloat(productData.discount_value),
            discountEndDate: productData.end_date,
            daysLeft, 
            stock: productData.stock_quantity,
            images: productData.image_url.map((url, i) => ({
              url,
              alt: `Product image ${i + 1}`,
            })),
            thumbnails: productData.image_url.map((url, i) => ({
              url,
              alt: `Thumbnail ${i + 1}`,
            })),
          };

          setProduct(formattedProduct)
        }
      } catch (err) {
        console.error("Error fetching product:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  if (loading) return <h1>Loading...</h1>
  if (!product) return <h1>Product not found</h1>

  return (
    <ProductWrapper>
      <ImageCarousel
        productImages={product.images}
        productThumbnails={product.thumbnails}
      />
      <ProductInfo
        productId={product.productId}
        companyName={product.companyName}
        productName={product.productName}
        productDescription={product.productDescription}
        productPrice={product.productPrice}
        isOnSale={product.isOnSale}
        discountType={product.discountType}
        discountValue={product.discountValue}
        productImages={product.images}
        daysLeft={product.daysLeft}
        stock={product.stock}
      />
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
`;

export default Product;