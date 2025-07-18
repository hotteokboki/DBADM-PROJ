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
  const [imageFiles, setImageFiles] = useState([])
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files)) // convert FileList to array
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let uploadedImageUrls = [];

      // 1. Upload all selected images first
      if (imageFiles && imageFiles.length > 0) {
        for (let file of imageFiles) {
          const imageData = new FormData();
          imageData.append("image", file);

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

          const data = res.data;
          if (data.success) {
            uploadedImageUrls.push(data.imageUrl);
          } else {
            throw new Error(data.message || "Image upload failed");
          }
        }
      }

      // 2. Submit product with uploaded image URLs
      const productPayload = {
        ...formData,
        image_urls: uploadedImageUrls, // plural if backend expects multiple images
      };

      const res = await axios.post(
        `${import.meta.env.VITE_WEB_APP_BACKEND_PORT}/api/products/insert-products`,
        productPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        showSnackbar(res.data.message || "Product saved successfully", "success");
      } else {
        throw new Error(res.data.message || "Product insertion failed");
      }

      // Reset form
      setFormData({
        product_name: "",
        product_description: "",
        price: "",
        image_url: "",
      });
      setImageFiles(null);

    } catch (err) {
      console.error("Error during product creation:", err);
      showSnackbar(err.message || "Failed to save product.", "error");
    }
  };


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
            multiple
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
