import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    {/* <Router>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/signin' element={<SignInUser />} />
          <Route path='/signup' element={<SignUpUser />} />
          <Route path='/blogallCard' element={<BlogAllCard />} />
          <Route path='/blogyourcard' element={<BlogYourCard />} />
          <Route path='/blog-create-card' element={<BlogCreateCard />} />
          <Route path='/blog-edit-card' element={<BlogEditCard />} />
          <Route path='/All-Card-Show/:topic' element={<AllCardShow />} />
          <Route path='/User-Card-Show/:topic' element={<UserCardShow />} />
          <Route path='/shareblogbyother' element={<ShareBlogByOther />} />
          <Route path='/shareblogbyyou' element={<ShareBlogByYou />} />
          {/* //Home */}
          {/* <Route path='/home' element={<Home />} /> */}
          {/* //dashboard */}
          {/* <Route path='/dashboard' element={<Dashboard />} /> */}
          {/* SearchQuery */}
          {/* <Route path='/searchpage/:searchQuery' element={<SearchPage />} /> */}
          {/* <Route path='/share-blog-Card-show-other/:topic' element={<ShareBlogCardShowOther />} /> */}
        {/* </Routes> */}
      {/* </Router> */} 
  </React.StrictMode>,
)
