import React, { useState, useRef } from "react";
import axios from "axios";
import "./vedio.css";

export default function VideoUploadPage() {
  const [formData, setFormData] = useState({
    signName: "",
    description: "",
    difficulty: "",
    category: "",
    video: null,
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // success, error, info
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];
  const categorySuggestions = [
    "Greetings",
    "Numbers", 
    "Family",
    "Food",
    "Travel",
    "Emergency",
    "Education",
    "Colors",
    "Animals",
    "Actions"
  ];

  // Validation functions
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.signName.trim()) {
      newErrors.signName = "Sign name is required";
    } else if (formData.signName.length < 2) {
      newErrors.signName = "Sign name must be at least 2 characters";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (!formData.difficulty) {
      newErrors.difficulty = "Please select a difficulty level";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (!formData.video) {
      newErrors.video = "Please select a video file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateVideoFile = (file) => {
    const maxSize = 100 * 1024 * 1024; // 100MB
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    
    if (file.size > maxSize) {
      return "Video file must be less than 100MB";
    }
    
    if (!allowedTypes.includes(file.type)) {
      return "Please upload a valid video file (MP4, WebM, OGG, AVI, MOV)";
    }
    
    return null;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (files && files[0]) {
      const file = files[0];
      const videoError = validateVideoFile(file);
      
      if (videoError) {
        setErrors(prev => ({ ...prev, video: videoError }));
        return;
      }
      
      setFormData(prev => ({ ...prev, video: file }));
      setErrors(prev => ({ ...prev, video: "" }));
      
      // Create preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const videoUrl = URL.createObjectURL(file);
      setPreviewUrl(videoUrl);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      // Clear field-specific error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: "" }));
      }
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const videoError = validateVideoFile(file);
      
      if (videoError) {
        setErrors(prev => ({ ...prev, video: videoError }));
        return;
      }
      
      handleFileSelection(file);
    }
  };

  const handleFileSelection = (file) => {
    setFormData(prev => ({ ...prev, video: file }));
    setErrors(prev => ({ ...prev, video: "" }));
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const videoUrl = URL.createObjectURL(file);
    setPreviewUrl(videoUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage("Please fix the errors below");
      setMessageType("error");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setMessage("Preparing upload...");
    setMessageType("info");

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    try {
      const res = await axios.post("http://127.0.0.1:8000/video", data, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
          setMessage(`Uploading... ${percentCompleted}%`);
        },
      });
      
      setMessage(res.data.message || "Video uploaded successfully!");
      setMessageType("success");
      
      // Reset form
      setFormData({
        signName: "",
        description: "",
        difficulty: "",
        category: "",
        video: null,
      });
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
      setErrors({});
      
    } catch (err) {
      console.error("Upload error:", err);
      setMessage(
        err.response?.data?.message || 
        err.message || 
        "Failed to upload video. Please try again."
      );
      setMessageType("error");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 5000);
    }
  };

  const removeVideo = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setFormData(prev => ({ ...prev, video: null }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <div className="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
        </div>
        <h1 className="upload-title">Upload Sign Language Video</h1>
        <p className="upload-subtitle">
          Share your knowledge and help expand our sign language learning community
        </p>
      </div>

      {message && (
        <div className={`upload-message ${messageType}`}>
          <div className="message-content">
            {messageType === 'success' && (
              <svg className="message-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            )}
            {messageType === 'error' && (
              <svg className="message-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
            )}
            {messageType === 'info' && (
              <svg className="message-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
            )}
            {message}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-grid">
          {/* Left Column */}
          <div className="form-column">
            <div className="form-group">
              <label className="form-label">
                Sign Name <span className="required">*</span>
              </label>
              <input
                type="text"
                name="signName"
                value={formData.signName}
                onChange={handleChange}
                className={`form-input ${errors.signName ? 'error' : ''}`}
                placeholder="e.g., Hello, Thank You, Good Morning"
                disabled={isUploading}
              />
              {errors.signName && <span className="error-message">{errors.signName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Describe how and when this sign is used, including hand movements and positioning..."
                rows="4"
                disabled={isUploading}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
              <div className="char-count">
                {formData.description.length}/500 characters
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Difficulty <span className="required">*</span>
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className={`form-select ${errors.difficulty ? 'error' : ''}`}
                  disabled={isUploading}
                >
                  <option value="">Select Level</option>
                  {difficultyOptions.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
                {errors.difficulty && <span className="error-message">{errors.difficulty}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Category <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="category"
                  list="categories"
                  value={formData.category}
                  onChange={handleChange}
                  className={`form-input ${errors.category ? 'error' : ''}`}
                  placeholder="Choose or type a category"
                  disabled={isUploading}
                />
                <datalist id="categories">
                  {categorySuggestions.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.category && <span className="error-message">{errors.category}</span>}
              </div>
            </div>
          </div>

          {/* Right Column - Video Upload */}
          <div className="form-column">
            <div className="form-group">
              <label className="form-label">
                Video Upload <span className="required">*</span>
              </label>
              
              <div 
                className={`upload-dropzone ${dragActive ? 'drag-active' : ''} ${errors.video ? 'error' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!previewUrl ? (
                  <div className="dropzone-content">
                    <div className="upload-icon-large">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="12" y1="18" x2="12" y2="12"/>
                        <polyline points="9,15 12,12 15,15"/>
                      </svg>
                    </div>
                    <h3>Drop your video here or click to browse</h3>
                    <p>Supports MP4, WebM, OGG, AVI, MOV up to 100MB</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      name="video"
                      accept="video/*"
                      onChange={handleChange}
                      className="file-input-hidden"
                      disabled={isUploading}
                    />
                    <button 
                      type="button" 
                      className="browse-button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      Choose File
                    </button>
                  </div>
                ) : (
                  <div className="video-preview-container">
                    <video className="video-preview" src={previewUrl} controls />
                    <div className="video-info">
                      <p><strong>{formData.video?.name}</strong></p>
                      <p>{(formData.video?.size / (1024 * 1024)).toFixed(2)} MB</p>
                      <button 
                        type="button" 
                        className="remove-video-btn"
                        onClick={removeVideo}
                        disabled={isUploading}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {errors.video && <span className="error-message">{errors.video}</span>}
            </div>

            {isUploading && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <div className="progress-text">{uploadProgress}% uploaded</div>
              </div>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className={`submit-button ${isUploading ? 'uploading' : ''}`}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <svg className="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M21 12a9 9 0 11-6.219-8.56"/>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="12" y1="18" x2="12" y2="12"/>
                  <polyline points="9,15 12,12 15,15"/>
                </svg>
                Upload Video
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}