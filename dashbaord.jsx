import React, { useState, useEffect, useRef } from 'react';
import './dashboard.css';
import { Users, Video, TrendingUp, Activity, RefreshCw, ChevronDown, Calendar, Filter, Download, BarChart3, PieChart, Eye, Clock, X, Search, Mail, Phone, User, FileText, Languages, MessageSquare, AlertCircle, Play, Info } from 'lucide-react';

const AdminDashboard = () => {
  const [deafUsers, setDeafUsers] = useState([]);
  const [videos, setVideos] = useState([]);
  const [allDeafUsers, setAllDeafUsers] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [difficultyStats, setDifficultyStats] = useState([]);
  const [communicationStats, setCommunicationStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('7d');
  const [showFilters, setShowFilters] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  
  // Modal states
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [showVideosModal, setShowVideosModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [videoSearchTerm, setVideoSearchTerm] = useState('');

  const chartRefs = {
    category: useRef(null),
    difficulty: useRef(null),
    communication: useRef(null),
    gender: useRef(null),
    language: useRef(null)
  };
  const chartInstances = {
    category: useRef(null),
    difficulty: useRef(null),
    communication: useRef(null),
    gender: useRef(null),
    language: useRef(null)
  };

  const API_BASE = 'http://localhost:8000';
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#3b82f6'];

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, videosRes, catRes, diffRes, commRes, allUsersRes, allVideosRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/deaf-users`),
        fetch(`${API_BASE}/dashboard/videos`),
        fetch(`${API_BASE}/dashboard/videos-by-category`),
        fetch(`${API_BASE}/dashboard/videos-by-difficulty`),
        fetch(`${API_BASE}/dashboard/users-by-communication`),
        fetch(`${API_BASE}/dashboard/all-deaf-users`),
        fetch(`${API_BASE}/dashboard/all-videos`)
      ]);

      const usersData = await usersRes.json();
      const videosData = await videosRes.json();
      const catData = await catRes.json();
      const diffData = await diffRes.json();
      const commData = await commRes.json();
      const allUsersData = await allUsersRes.json();
      const allVideosData = await allVideosRes.json();

      setDeafUsers(usersData.deafUsers || []);
      setVideos(videosData.videos || []);
      setAllDeafUsers(allUsersData.allDeafUsers || []);
      setAllVideos(allVideosData.allVideos || []);
      setCategoryStats(catData.categoryStats || []);
      setDifficultyStats(diffData.difficultyStats || []);
      setCommunicationStats(commData.communicationStats || []);
      setLastUpdated(new Date());
      setAnimateStats(true);
      setTimeout(() => setAnimateStats(false), 1000);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      const loadChartJS = async () => {
        try {
          const Chart = (await import('chart.js/auto')).default;
          renderAllCharts(Chart);
        } catch (err) {
          console.error('Error loading Chart.js:', err);
        }
      };
      loadChartJS();
    }

    return () => {
      Object.values(chartInstances).forEach(ref => {
        if (ref.current) {
          ref.current.destroy();
        }
      });
    };
  }, [loading, error, categoryStats, difficultyStats, communicationStats, deafUsers]);

  const renderAllCharts = (Chart) => {
    if (categoryStats.length > 0) renderCategoryChart(Chart);
    if (difficultyStats.length > 0) renderDifficultyChart(Chart);
    if (communicationStats.length > 0) renderCommunicationChart(Chart);
    if (deafUsers.length > 0) {
      renderGenderChart(Chart);
      renderLanguageChart(Chart);
    }
  };

  const renderCategoryChart = (Chart) => {
    if (chartInstances.category.current) chartInstances.category.current.destroy();
    if (!chartRefs.category.current) return;
    
    const ctx = chartRefs.category.current.getContext('2d');
    chartInstances.category.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categoryStats.map(s => s._id || 'Uncategorized'),
        datasets: [{
          label: 'Number of Videos',
          data: categoryStats.map(s => s.count),
          backgroundColor: categoryStats.map((_, i) => COLORS[i % COLORS.length]),
          borderRadius: 10,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 }
          }
        },
        scales: { 
          y: { 
            beginAtZero: true, 
            ticks: { stepSize: 1, color: '#6b7280', font: { size: 12 } },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            ticks: { color: '#6b7280', font: { size: 12 } },
            grid: { display: false }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  };

  const renderDifficultyChart = (Chart) => {
    if (chartInstances.difficulty.current) chartInstances.difficulty.current.destroy();
    if (!chartRefs.difficulty.current) return;
    
    const ctx = chartRefs.difficulty.current.getContext('2d');
    chartInstances.difficulty.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: difficultyStats.map(s => s._id || 'Unspecified'),
        datasets: [{
          data: difficultyStats.map(s => s.count),
          backgroundColor: COLORS.slice(0, difficultyStats.length),
          borderWidth: 4,
          borderColor: '#fff',
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 13 },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1200
        }
      }
    });
  };

  const renderCommunicationChart = (Chart) => {
    if (chartInstances.communication.current) chartInstances.communication.current.destroy();
    if (!chartRefs.communication.current) return;
    
    const ctx = chartRefs.communication.current.getContext('2d');
    chartInstances.communication.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: communicationStats.map(s => s._id || 'Not Set'),
        datasets: [{
          label: 'Number of Users',
          data: communicationStats.map(s => s.count),
          backgroundColor: communicationStats.map((_, i) => COLORS[i % COLORS.length]),
          borderRadius: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8
          }
        },
        scales: { 
          y: { 
            beginAtZero: true, 
            ticks: { stepSize: 1, color: '#6b7280' },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          x: {
            ticks: { color: '#6b7280' },
            grid: { display: false }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  };

  const renderGenderChart = (Chart) => {
    if (chartInstances.gender.current) chartInstances.gender.current.destroy();
    if (!chartRefs.gender.current) return;
    
    const genderCount = deafUsers.reduce((acc, user) => {
      acc[user.gender || 'Not Specified'] = (acc[user.gender || 'Not Specified'] || 0) + 1;
      return acc;
    }, {});
    
    const ctx = chartRefs.gender.current.getContext('2d');
    chartInstances.gender.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: Object.keys(genderCount),
        datasets: [{
          data: Object.values(genderCount),
          backgroundColor: COLORS.slice(0, Object.keys(genderCount).length),
          borderWidth: 4,
          borderColor: '#fff',
          hoverOffset: 15
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { 
            position: 'bottom',
            labels: {
              padding: 15,
              font: { size: 13 },
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8
          }
        },
        animation: {
          duration: 1200
        }
      }
    });
  };

  const renderLanguageChart = (Chart) => {
    if (chartInstances.language.current) chartInstances.language.current.destroy();
    if (!chartRefs.language.current) return;
    
    const langCount = deafUsers.reduce((acc, user) => {
      const lang = user.preferredSignLanguage || 'Not Specified';
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {});
    
    const ctx = chartRefs.language.current.getContext('2d');
    chartInstances.language.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(langCount),
        datasets: [{
          label: 'Number of Users',
          data: Object.values(langCount),
          backgroundColor: Object.keys(langCount).map((_, i) => COLORS[i % COLORS.length]),
          borderRadius: 10
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: { 
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            borderRadius: 8
          }
        },
        scales: { 
          x: { 
            beginAtZero: true, 
            ticks: { stepSize: 1, color: '#6b7280' },
            grid: { color: 'rgba(0, 0, 0, 0.05)' }
          },
          y: {
            ticks: { color: '#6b7280' },
            grid: { display: false }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  };

  const getTotalUsers = () => deafUsers.length;
  const getTotalVideos = () => videos.length;
  
  const getRecentVideos = () => {
    return videos
      .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
      .slice(0, 5);
  };

  // Filter users based on search
  const filteredUsers = allDeafUsers.filter(user => {
    const searchLower = userSearchTerm.toLowerCase();
    return (
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.includes(userSearchTerm)
    );
  });

  // Filter videos based on search
  const filteredVideos = allVideos.filter(video => {
    const searchLower = videoSearchTerm.toLowerCase();
    return (
      video.signName?.toLowerCase().includes(searchLower) ||
      video.category?.toLowerCase().includes(searchLower) ||
      video.difficulty?.toLowerCase().includes(searchLower) ||
      video.uploadedBy?.toLowerCase().includes(searchLower)
    );
  });

  const StatCard = ({ title, value, icon: Icon, gradient, change, onClick }) => (
    <div className={`stat-card ${animateStats ? 'animate-stat' : ''} ${onClick ? 'clickable' : ''}`} onClick={onClick}>
      <div className={`stat-icon-wrapper ${gradient}`}>
        <Icon className="stat-icon" size={28} />
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
        {change && (
          <span className={`stat-change ${change > 0 ? 'positive' : 'negative'}`}>
            {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
          </span>
        )}
      </div>
      {onClick && <Eye className="stat-view-icon" size={18} />}
    </div>
  );

  // User Details Modal Component
  const UserDetailsModal = ({ user, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-details-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <User size={24} />
            User Details
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <div className="user-details-grid">
            <div className="detail-card">
              <div className="detail-icon">
                <User size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{user.fullName || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <User size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Username</span>
                <span className="detail-value">{user.username || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Mail size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Email</span>
                <span className="detail-value">{user.email || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Phone size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Phone</span>
                <span className="detail-value">{user.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Users size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Gender</span>
                <span className="detail-value">{user.gender || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Calendar size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Date of Birth</span>
                <span className="detail-value">{user.dateOfBirth || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Languages size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Preferred Sign Language</span>
                <span className="detail-value">{user.preferredSignLanguage || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <MessageSquare size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Communication Preference</span>
                <span className="detail-value">{user.communicationPreference || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card full-width">
              <div className="detail-icon">
                <AlertCircle size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Emergency Contact</span>
                <span className="detail-value">
                  {user.emergencyContactName || 'N/A'} - {user.emergencyContactNumber || 'N/A'}
                </span>
              </div>
            </div>

            <div className="detail-card full-width">
              <div className="detail-icon">
                <FileText size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Medical Notes</span>
                <span className="detail-value">{user.medicalNotes || 'No medical notes'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Clock size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Account Created</span>
                <span className="detail-value">{user.createdAt || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <User size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Role</span>
                <span className="detail-value badge badge-blue">{user.role || 'deaf'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Video Details Modal Component
  const VideoDetailsModal = ({ video, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content video-details-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <Play size={24} />
            Video Details
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-body">
          <div className="video-preview">
            <video 
              src={`${API_BASE}${video.videoUrl}`} 
              controls 
              className="video-player"
              poster="/api/placeholder/800/450"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="video-details-grid">
            <div className="detail-card">
              <div className="detail-icon">
                <FileText size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Sign Name</span>
                <span className="detail-value">{video.signName || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <TrendingUp size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Category</span>
                <span className="detail-value badge badge-blue">{video.category || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Activity size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Difficulty</span>
                <span className={`detail-value badge ${
                  video.difficulty === 'Beginner' ? 'badge-green' :
                  video.difficulty === 'Intermediate' ? 'badge-yellow' :
                  'badge-red'
                }`}>
                  {video.difficulty || 'N/A'}
                </span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <User size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Uploaded By</span>
                <span className="detail-value">{video.uploadedBy || 'Admin'}</span>
              </div>
            </div>

            <div className="detail-card">
              <div className="detail-icon">
                <Calendar size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Upload Date</span>
                <span className="detail-value">{video.uploadedAt || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-card full-width">
              <div className="detail-icon">
                <Info size={20} />
              </div>
              <div className="detail-content">
                <span className="detail-label">Description</span>
                <span className="detail-value">{video.description || 'No description available'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader">
          <RefreshCw className="loader-icon" size={48} />
          <p className="loader-text">Loading Dashboard...</p>
          <div className="loader-bar"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-card">
          <div className="error-icon">⚠️</div>
          <h2 className="error-title">Connection Error</h2>
          <p className="error-message">{error}</p>
          <button onClick={fetchDashboardData} className="retry-button">
            <RefreshCw size={20} />
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              <BarChart3 size={36} className="title-icon" />
              Admin Dashboard
            </h1>
          </div>
          <div className="header-right">
            <button onClick={() => setShowFilters(!showFilters)} className="filter-button">
              <Filter size={18} />
              Filters
              <ChevronDown size={16} className={showFilters ? 'rotate' : ''} />
            </button>
            <button onClick={fetchDashboardData} className="refresh-button">
              <RefreshCw size={18} />
              Refresh
            </button>
            <button
              className="refresh-button"
              onClick={() => window.location.href = "http://localhost:5173/tuter"}
            >
              Add Video
            </button>
            <button
              className="refresh-button"
              onClick={() => window.location.href = "http://localhost:5173/map"}
            >
              Location Tracker
            </button>
          </div>
        </div>
        
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-group">
              <label>Time Range</label>
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="filter-select">
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="all">All Time</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Category</label>
              <select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="filter-select">
                <option value="all">All Categories</option>
                {categoryStats.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat._id}</option>
                ))}
              </select>
            </div>
          </div>
        )}
        
        <div className="last-updated">
          <Clock size={14} />
          Last updated: {lastUpdated.toLocaleString()}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Users"
          value={getTotalUsers()}
          icon={Users}
          gradient="gradient-blue"
          change={12}
          onClick={() => setShowUsersModal(true)}
        />
        <StatCard
          title="Total Videos"
          value={getTotalVideos()}
          icon={Video}
          gradient="gradient-purple"
          change={8}
          onClick={() => setShowVideosModal(true)}
        />
        <StatCard
          title="Categories"
          value={categoryStats.length}
          icon={TrendingUp}
          gradient="gradient-pink"
          change={5}
        />
        <StatCard
          title="Avg Videos/Category"
          value={categoryStats.length > 0 ? Math.round(getTotalVideos() / categoryStats.length) : 0}
          icon={Activity}
          gradient="gradient-green"
          change={-3}
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Videos by Category</h3>
            <button className="chart-action" title="View Details">
              <Eye size={18} />
            </button>
          </div>
          <div className="chart-wrapper">
            <canvas ref={chartRefs.category}></canvas>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Difficulty Distribution</h3>
            <button className="chart-action" title="View Details">
              <PieChart size={18} />
            </button>
          </div>
          <div className="chart-wrapper">
            <canvas ref={chartRefs.difficulty}></canvas>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Communication Preferences</h3>
            <button className="chart-action" title="Export Data">
              <Download size={18} />
            </button>
          </div>
          <div className="chart-wrapper">
            <canvas ref={chartRefs.communication}></canvas>
          </div>
        </div>
      </div>

      {/* Language Chart - Full Width */}
      <div className="chart-card-wide">
        <div className="chart-header">
          <h3 className="chart-title">Preferred Sign Languages</h3>
          <button className="chart-action" title="Export Data">
            <Download size={18} />
          </button>
        </div>
        <div className="chart-wrapper-horizontal">
          <canvas ref={chartRefs.language}></canvas>
        </div>
      </div>

      {/* Recent Videos Table */}
      <div className="table-card">
        <div className="table-header">
          <h3 className="table-title">Recent Videos</h3>
          <button className="export-button">
            <Download size={16} />
            Export
          </button>
        </div>
        <div className="table-wrapper">
          {getRecentVideos().length > 0 ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Sign Name</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Uploaded By</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getRecentVideos().map((video, idx) => (
                  <tr key={video._id} className="table-row" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <td className="font-medium">{video.signName}</td>
                    <td>
                      <span className="badge badge-blue">{video.category}</span>
                    </td>
                    <td>
                      <span className={`badge ${
                        video.difficulty === 'Beginner' ? 'badge-green' :
                        video.difficulty === 'Intermediate' ? 'badge-yellow' :
                        'badge-red'
                      }`}>
                        {video.difficulty}
                      </span>
                    </td>
                    <td className="text-gray">{video.uploadedBy}</td>
                    <td className="text-gray">{video.uploadedAt}</td>
                    <td>
                      <button 
                        className="action-button"
                        onClick={() => setSelectedVideo(video)}
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <Video size={48} className="empty-icon" />
              <p className="empty-text">No videos uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* All Users Modal */}
      {showUsersModal && (
        <div className="modal-overlay" onClick={() => setShowUsersModal(false)}>
          <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Users size={24} />
                All Deaf Users ({allDeafUsers.length})
              </h2>
              <button className="modal-close" onClick={() => setShowUsersModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search users by name, username, email or phone..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="modal-body">
              <div className="users-grid">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <div 
                      key={user._id} 
                      className="user-card"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="user-card-header">
                        <div className="user-avatar">
                          {user.fullName?.charAt(0) || 'U'}
                        </div>
                        <div className="user-info">
                          <h4 className="user-name">{user.fullName || 'N/A'}</h4>
                          <p className="user-username">@{user.username || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="user-card-body">
                        <div className="user-detail-row">
                          <Mail size={16} />
                          <span>{user.email || 'N/A'}</span>
                        </div>
                        <div className="user-detail-row">
                          <Phone size={16} />
                          <span>{user.phone || 'N/A'}</span>
                        </div>
                        <div className="user-detail-row">
                          <Languages size={16} />
                          <span>{user.preferredSignLanguage || 'N/A'}</span>
                        </div>
                        <div className="user-detail-row">
                          <MessageSquare size={16} />
                          <span>{user.communicationPreference || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="user-card-footer">
                        <span className="badge badge-blue">{user.role || 'deaf'}</span>
                        <span className="user-date">
                          <Calendar size={14} />
                          {user.createdAt || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state-modal">
                    <Users size={48} className="empty-icon" />
                    <p className="empty-text">No users found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Videos Modal */}
      {showVideosModal && (
        <div className="modal-overlay" onClick={() => setShowVideosModal(false)}>
          <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <Video size={24} />
                All Videos ({allVideos.length})
              </h2>
              <button className="modal-close" onClick={() => setShowVideosModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-search">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search videos by name, category, difficulty or uploader..."
                value={videoSearchTerm}
                onChange={(e) => setVideoSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="modal-body">
              <div className="videos-grid">
                {filteredVideos.length > 0 ? (
                  filteredVideos.map((video, idx) => (
                    <div 
                      key={video._id} 
                      className="video-card"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                      onClick={() => setSelectedVideo(video)}
                    >
                      <div className="video-thumbnail">
                        <video 
                          src={`${API_BASE}${video.videoUrl}`}
                          className="video-thumbnail-player"
                        />
                        <div className="video-overlay">
                          <Play size={40} />
                        </div>
                      </div>
                      <div className="video-card-body">
                        <h4 className="video-title">{video.signName || 'Untitled'}</h4>
                        <p className="video-description">
                          {video.description 
                            ? (video.description.length > 80 
                                ? video.description.substring(0, 80) + '...' 
                                : video.description)
                            : 'No description'}
                        </p>
                        <div className="video-meta">
                          <span className="badge badge-blue">{video.category || 'N/A'}</span>
                          <span className={`badge ${
                            video.difficulty === 'Beginner' ? 'badge-green' :
                            video.difficulty === 'Intermediate' ? 'badge-yellow' :
                            'badge-red'
                          }`}>
                            {video.difficulty || 'N/A'}
                          </span>
                        </div>
                        <div className="video-footer">
                          <div className="video-uploader">
                            <User size={14} />
                            {video.uploadedBy || 'Admin'}
                          </div>
                          <div className="video-date">
                            <Calendar size={14} />
                            {video.uploadedAt || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state-modal">
                    <Video size={48} className="empty-icon" />
                    <p className="empty-text">No videos found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}

      {/* Video Details Modal */}
      {selectedVideo && (
        <VideoDetailsModal 
          video={selectedVideo} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;