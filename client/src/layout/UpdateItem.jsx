import styled from "styled-components"
import React, { useState, useEffect } from "react"
import axios from "axios"
import { useGlobalContext } from "../context/context"

export default function UpdateItem() {
  const { showSnackbar } = useGlobalContext()
  const [productList, setProductList] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    price: "",
    stock: "",
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/products/get-all`)
      if (res.data.success) setProductList(res.data.products)
    } catch (err) {
      console.error("Error fetching products:", err)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleEditClick = (product) => {
    setEditingProduct(product.product_id)
    setFormData({
      product_name: product.product_name,
      description: product.description,
      price: product.price,
      stock: product.stock,
    })
  }

  const handleUpdateSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/products/update/${editingProduct}`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      )
      if (res.data.success) {
        showSnackbar("Product updated successfully!", "success")
        setEditingProduct(null)
        setFormData({ product_name: "", description: "", price: "", stock: "" })
        fetchProducts()
      } else {
        throw new Error(res.data.message)
      }
    } catch (err) {
      showSnackbar(err.message || "Failed to update product.", "error")
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/products/set-inactive/${productId}`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        showSnackbar("Product deleted successfully!", "success")
        fetchProducts()
      } else {
        throw new Error(res.data.message)
      }
    } catch (err) {
      showSnackbar(err.message || "Failed to delete product.", "error")
    }
  }

  return (
    <Grid>
      <h1>Manage Products</h1>

      {editingProduct && (
        <Form onSubmit={handleUpdateSubmit}>
          <h2>Edit Product</h2>
          <label>
            Name
            <input
              type="text"
              name="product_name"
              value={formData.product_name}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Price
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Stock
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">Update Product</button>
        </Form>
      )}

      <ProductList>
        {productList.map((product) => (
          <div key={product.product_id} className="product">
            <h3>{product.product_name}</h3>
            <p>{product.description}</p>
            <p>Price: ₱{product.price}</p>
            <p>Stock: {product.stock}</p>
            <div className="actions">
              <button onClick={() => handleEditClick(product)}>Edit</button>
              <button onClick={() => handleDelete(product.product_id)}>Delete</button>
            </div>
          </div>
        ))}
      </ProductList>
    </Grid>
  )
}

const Grid = styled.section`
  max-width: 900px;
  margin: 4rem auto;
  padding: 2rem;
  border-radius: 1rem;
  background: #f9f9f9;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);

  h1 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 2rem;
  }

  h2 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  button {
    padding: 0.6rem 1.2rem;
    font-size: 1rem;
    background-color: #0077ff;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
  }

  button:hover {
    background-color: #005dc1;
  }
`

const Form = styled.form`
  display: grid;
  gap: 1.5rem;
  margin-bottom: 3rem;

  label {
    display: flex;
    flex-direction: column;
    font-weight: 600;
    font-size: 1.1rem;
  }

  input, select, textarea {
    margin-top: 0.5rem;
    padding: 0.8rem 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    font-size: 1rem;
    background: #fff;
    transition: 0.2s ease;
  }

  input:focus, textarea:focus, select:focus {
    border-color: #0077ff;
    outline: none;
  }
`

const ProductList = styled.div`
  display: grid;
  gap: 1.5rem;

  .product {
    padding: 1rem;
    border-radius: 0.5rem;
    background: #ffffff;
    box-shadow: 0 0 0.5rem rgba(0, 0, 0, 0.05);

    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
    }

    p {
      margin: 0.2rem 0;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
  }
`