import styled from "styled-components"
import React, { useState } from "react"
import axios from "axios";
import { useGlobalContext } from "../context/context"

export default function AddItem() {
  const { showSnackbar } = useGlobalContext();
  const [formData, setFormData] = useState({
    product_name: "",
    product_description: "",
    price: "",
    image_url: ""
  })
  const [imageFile, setImageFile] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    let uploadedImageUrl = ""

    // Step 1: Upload image if selected
    if (imageFile) {
      const imageData = new FormData()
      imageData.append("image", imageFile)

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/upload`,
          imageData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
        const data = res.data
        if (data.success) {
          uploadedImageUrl = data.imageUrl
          showSnackbar(res.data.message, "success"); // ✅ this is the correct use
        } else {
          showSnackbar(res.data.message, "error");
          return
        }
      } catch (err) {
        console.error("Image upload error:", err)
        showSnackbar("Image upload failed. Please try again.", "error");
        return
      }
    }

    // Step 2: Submit product with image URL
    const productPayload = {
      ...formData,
      image_url: uploadedImageUrl,
    }

    console.log("Submitting product:", productPayload)

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/products/insert-products`,
        productPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, // if your backend uses sessions/cookies
        }
      );

      if (res.data.success) {
        showSnackbar(res.data.message, "success")
      } else {
        showSnackbar(res.data.message, "error")
      }
    } catch (err) {
      console.error("Error saving product:", err);
      showSnackbar("An error occurred while saving the product.", "error")
    }

    // Reset form (optional)
    setFormData({
      product_name: "",
      product_description: "",
      price: "",
      image_url: ""
    })
    setImageFile(null)
  }

  return (
    <Grid>
      <h1>Add Item</h1>
      <Form onSubmit={handleSubmit}>
        <label>
          Product Name
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
            name="product_description"
            rows="4"
            value={formData.product_description}
            onChange={handleChange}
          />
        </label>

        <label>
          Price
          <input
            type="number"
            name="price"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Upload Image
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />
        </label>

        <button type="submit">Add Product</button>
      </Form>
    </Grid>
  )
}

const Grid = styled.section`
  max-width: 700px;
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
`

const Form = styled.form`
  display: grid;
  gap: 1.5rem;

  label {
    display: flex;
    flex-direction: column;
    font-weight: 600;
    font-size: 1.1rem;
  }

  input, textarea {
    margin-top: 0.5rem;
    padding: 0.8rem 1rem;
    border: 1px solid #ccc;
    border-radius: 0.5rem;
    font-size: 1rem;
    background: #fff;
    transition: 0.2s ease;
  }

  input:focus, textarea:focus {
    border-color: #0077ff;
    outline: none;
  }

  button {
    padding: 0.9rem;
    font-size: 1.1rem;
    background-color: #0077ff;
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  button:hover {
    background-color: #005dc1;
  }
`
