
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './Pages/Home.jsx';
import StoryDetail from './Pages/StoryDetail.jsx';
import ChapterRead from './Pages/ChapterRead.jsx';

import Login from './Pages/Login.jsx';
import Register from './Pages/Register.jsx';
import Profile from './Pages/Profile.jsx';

import Categories from './Pages/Categories.jsx';
import AdminStories from './Pages/AdminStories.jsx';
import AdminChapters from './Pages/AdminChapters.jsx';
import AdminUsers from './Pages/AdminUsers.jsx';
import AdminComments from './Pages/AdminComments.jsx';

export default function Router() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="story/:storyId" element={<StoryDetail />} />
        <Route path="story/:storyId/chapter/:chapterNumber" element={<ChapterRead />} />

        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />

        <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* Admin area - bảo vệ bằng role */}
        <Route
          path="admin/categories"
          element={<ProtectedRoute role="admin"><Categories /></ProtectedRoute>}
        />
        <Route
          path="admin/stories"
          element={<ProtectedRoute role="admin"><AdminStories /></ProtectedRoute>}
        />
        <Route
          path="admin/chapters"
          element={<ProtectedRoute role="admin"><AdminChapters /></ProtectedRoute>}
        />
        <Route
          path="admin/users"
          element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>}
        />
        <Route
          path="admin/comments"
          element={<ProtectedRoute role="admin"><AdminComments /></ProtectedRoute>}
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
