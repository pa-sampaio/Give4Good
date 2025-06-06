import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import '../Edit/CreateAd.css';

const CreateAd = () => {
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm();
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  // Handler para upload de imagem
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file, file.name);

    try {
      const response = await fetch('http://localhost:8080/announcements/upload-image', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) throw new Error('Failed to upload image');
      const { url } = await response.json();
      setImageUrl(url);
      setValue('productPhotoUrl', url);
      toast.success('Image uploaded!');
    } catch (err) {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (formData) => {
    // O backend espera os campos:
    // productName, productDescription, productPhotoUrl, productCategory, userDonorId
    // Enviamos assim e o backend monta o objeto Product corretamente
    const data = {
      productName: formData.productName,
      productDescription: formData.productDescription,
      productPhotoUrl: imageUrl,
      productCategory: formData.productCategory,
      userDonorId: sessionStorage.getItem('userId')
    };

    try {
      const response = await fetch('http://localhost:8080/announcements/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong while creating the ad');
      }

      toast.success('Ad created successfully!');
      reset();
      setImageUrl('');
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const showErrors = () => {
    if (errors.productName) toast.error(errors.productName.message);
    if (errors.productDescription) toast.error(errors.productDescription.message);
    if (errors.productCategory) toast.error(errors.productCategory.message);
    if (errors.productPhotoUrl) toast.error(errors.productPhotoUrl.message);
  };

  return (
    <main>
      <ToastContainer />
      <div className="create-ad-container">
        <form className="create-ad-content" onSubmit={handleSubmit(onSubmit, showErrors)}>
          <div className="image-preview-container">
            {imageUrl ? (
              <img src={imageUrl} alt="Product Preview" className="image-preview" />
            ) : (
              <div className="image-placeholder">Select or upload an image</div>
            )}
            <div className="upload-btn-container">
              <label htmlFor="file-upload" className="custom-file-upload-beautiful">
                {uploading ? (
                  <span className="uploading-spinner"></span>
                ) : (
                  "Upload Image"
                )}
              </label>
              <input
                id="file-upload"
                type="file"
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </div>
          </div>

          <input
            {...register('productPhotoUrl', { required: 'Product photo URL is required' })}
            type="hidden"
            value={imageUrl}
            readOnly
          />

          <div className="input-container">
            <input
              {...register('productName', { required: 'Product name is required' })}
              type="text"
              className="text-input"
              placeholder="Name"
            />

            <input
              {...register('productDescription', { required: 'Product description is required' })}
              className="text-input-description-input"
              placeholder="Description"
            />

            <select
              {...register('productCategory', { required: 'Product category is required' })}
              className="text-input-category"
            >
              <option value="">Select Category</option>
              <option value="Leisure">Leisure</option>
              <option value="Real Estate">Real Estate</option>
              <option value="Sports">Sports</option>
              <option value="Technology">Technology</option>
              <option value="Tools">Tools</option>
            </select>
          </div>

          <div className="create-button-container">
            <button className="create-button" type="submit" disabled={uploading}>Create</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateAd;