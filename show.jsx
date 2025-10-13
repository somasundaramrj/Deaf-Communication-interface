import React, { useEffect, useState } from "react";
import { Play, Search, X, Grid, List, Check, Circle, Calendar, User, Folder, RefreshCw } from "lucide-react";
import "./show.css";

export default function VideoListPage() {
  const [videos, setVideos] = useState([]);
  const [search, setSearch] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [learnedSigns, setLearnedSigns] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("http://127.0.0.1:8000/videos");
        const data = await response.json();
        setVideos(data.videos || []);
        setError("");
      } catch (err) {
        console.error("Error fetching videos:", err);
        setError("Failed to load videos. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();

    // Load learned signs from memory (session storage alternative)
    const saved = sessionStorage.getItem('learnedSigns');
    if (saved) {
      try {
        setLearnedSigns(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error("Error loading learned signs:", e);
      }
    }
  }, []);

  const filtered = videos.filter((v) => {
    const searchLower = search.toLowerCase();
    const matchesSearch = search === "" || 
      v.signName?.toLowerCase().includes(searchLower) ||
      v.description?.toLowerCase().includes(searchLower) ||
      v.category?.toLowerCase().includes(searchLower);
    
    const matchesDifficulty = filterDifficulty === "All" || v.difficulty === filterDifficulty;
    const matchesCategory = filterCategory === "All" || v.category === filterCategory;
    
    return matchesSearch && matchesDifficulty && matchesCategory;
  });

  const categories = ["All", ...new Set(videos.map((v) => v.category).filter(Boolean))];

  const toggleLearned = (videoId) => {
    const newLearned = new Set(learnedSigns);
    if (newLearned.has(videoId)) {
      newLearned.delete(videoId);
    } else {
      newLearned.add(videoId);
    }
    setLearnedSigns(newLearned);
    try {
      sessionStorage.setItem('learnedSigns', JSON.stringify([...newLearned]));
    } catch (e) {
      console.error("Error saving learned signs:", e);
    }
  };

  const openVideoModal = (video) => {
    setSelectedVideo(video);
  };

  const closeVideoModal = () => {
    setSelectedVideo(null);
  };

  const getDifficultyConfig = (difficulty) => {
    const configs = {
      beginner: { color: '#4ade80', label: 'Beginner' },
      intermediate: { color: '#fbbf24', label: 'Intermediate' },
      advanced: { color: '#f87171', label: 'Advanced' }
    };
    return configs[difficulty?.toLowerCase()] || { color: '#94a3b8', label: difficulty || 'Unknown' };
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  const progressPercentage = videos.length > 0 ? (learnedSigns.size / videos.length * 100).toFixed(1) : 0;

  const clearFilters = () => {
    setSearch("");
    setFilterDifficulty("All");
    setFilterCategory("All");
  };

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <h3 className="loading-title">Loading Learning Hub</h3>
          <p className="loading-subtitle">Preparing your sign language lessons...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <X size={32} />
          </div>
          <h3 className="error-title">Unable to Load Content</h3>
          <p className="error-subtitle">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="retry-button"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="youtube-container">
      {/* YouTube-style Header */}
      <header className="youtube-header">
        <div className="header-wrapper">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-icon">
                <Play size={24} fill="white" />
              </div>
              <h1 className="logo-text">SignLearn</h1>
            </div>

            {/* Search Bar */}
            <div className="search-box">
              <input
                type="text"
                placeholder="Search signs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input-main"
              />
              <button className="search-button-main">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* View Toggle */}
          <div className="view-controls-header">
            <button 
              onClick={() => setViewMode('grid')}
              className={`view-btn-header ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <Grid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`view-btn-header ${viewMode === 'list' ? 'active' : ''}`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Progress Section */}
        {videos.length > 0 && (
          <div className="progress-card">
            <div className="progress-header-row">
              <div className="progress-info-section">
                <h3 className="progress-heading">Your Learning Progress</h3>
                <div className="progress-stats-row">
                  <span className="stat-number">{learnedSigns.size}</span>
                  <span className="stat-divider">/</span>
                  <span className="stat-total">{videos.length}</span>
                  <span className="stat-label">signs mastered</span>
                </div>
              </div>
              <div className="progress-percentage-section">
                <div className="percentage-large">{progressPercentage}%</div>
                <div className="percentage-small">Complete</div>
              </div>
            </div>
            <div className="progress-bar-wrapper">
              <div 
                className="progress-bar-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="filters-card">
          <div className="filters-row">
            <div className="filter-group">
              <label className="filter-label-text">Difficulty:</label>
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="filter-select-input"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label-text">Category:</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="filter-select-input"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
            </div>

            {(search || filterDifficulty !== "All" || filterCategory !== "All") && (
              <button 
                onClick={clearFilters}
                className="clear-btn"
              >
                Clear Filters
              </button>
            )}

            <div className="results-count-text">
              {filtered.length} of {videos.length} signs
            </div>
          </div>
        </div>

        {/* Video Grid/List */}
        {filtered.length === 0 ? (
          <div className="empty-state-card">
            <Search size={64} className="empty-icon" />
            <h3 className="empty-title">No Signs Found</h3>
            <p className="empty-subtitle">
              {search || filterDifficulty !== "All" || filterCategory !== "All" 
                ? "Try adjusting your search criteria or filters"
                : "No videos have been uploaded yet"
              }
            </p>
            {(search || filterDifficulty !== "All" || filterCategory !== "All") && (
              <button 
                onClick={clearFilters}
                className="clear-all-button"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className={`videos-container ${viewMode}-mode`}>
            {filtered.map((video) => {
              const difficultyConfig = getDifficultyConfig(video.difficulty);
              const isLearned = learnedSigns.has(video._id);
              
              return (
                <div 
                  key={video._id}
                  className={`video-card-item ${isLearned ? 'learned-card' : ''}`}
                >
                  {/* Thumbnail */}
                  <div 
                    className="video-thumbnail"
                    onClick={() => openVideoModal(video)}
                  >
                    <video
                      className="thumbnail-video"
                      src={`http://127.0.0.1:8000/${video.videoUrl}`}
                      muted
                      preload="metadata"
                    />
                    <div className="play-overlay-button">
                      <div className="play-circle">
                        <Play size={24} fill="white" className="play-icon-svg" />
                      </div>
                    </div>
                    {isLearned && (
                      <div className="learned-badge-overlay">
                        <Check size={12} />
                        Learned
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="card-body">
                    <h3 className="card-title">{video.signName}</h3>
                    <p className="card-description">{video.description}</p>
                    
                    <div className="card-meta-row">
                      <span 
                        className="difficulty-badge-card"
                        style={{ backgroundColor: difficultyConfig.color }}
                      >
                        {difficultyConfig.label}
                      </span>
                      <span className="meta-item-card">
                        <Folder size={12} />
                        {video.category}
                      </span>
                      <span className="meta-item-card">
                        <Calendar size={12} />
                        {formatDate(video.uploadedAt)}
                      </span>
                    </div>

                    <button 
                      onClick={() => toggleLearned(video._id)}
                      className={`learn-button-card ${isLearned ? 'learned-btn' : ''}`}
                    >
                      {isLearned ? (
                        <>
                          <Check size={16} />
                          Learned
                        </>
                      ) : (
                        <>
                          <Circle size={16} />
                          Mark as Learned
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="video-modal-overlay" onClick={closeVideoModal}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header-section">
              <div className="modal-title-group">
                <h2 className="modal-video-title">{selectedVideo.signName}</h2>
                <span 
                  className="modal-difficulty-badge"
                  style={{ backgroundColor: getDifficultyConfig(selectedVideo.difficulty).color }}
                >
                  {getDifficultyConfig(selectedVideo.difficulty).label}
                </span>
              </div>
              <button 
                onClick={closeVideoModal}
                className="modal-close-btn"
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="modal-body-section">
              <div className="modal-video-wrapper">
                <video
                  className="modal-video-player"
                  src={`http://127.0.0.1:8000/${selectedVideo.videoUrl}`}
                  controls
                  autoPlay
                />
              </div>
              
              <div className="modal-info-section">
                <div className="modal-meta-row">
                  <span className="modal-meta-item">
                    <Folder size={16} />
                    {selectedVideo.category}
                  </span>
                  <span className="modal-meta-item">
                    <Calendar size={16} />
                    {formatDate(selectedVideo.uploadedAt)}
                  </span>
                  {selectedVideo.uploadedBy && (
                    <span className="modal-meta-item">
                      <User size={16} />
                      {selectedVideo.uploadedBy}
                    </span>
                  )}
                </div>
                
                <div className="modal-description-section">
                  <h4 className="modal-description-title">Description</h4>
                  <p className="modal-description-text">{selectedVideo.description}</p>
                </div>
                
                <button 
                  onClick={() => toggleLearned(selectedVideo._id)}
                  className={`modal-action-button ${learnedSigns.has(selectedVideo._id) ? 'learned-action' : ''}`}
                >
                  {learnedSigns.has(selectedVideo._id) ? (
                    <>
                      <Check size={20} />
                      Learned
                    </>
                  ) : (
                    <>
                      <Circle size={20} />
                      Mark as Learned
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}