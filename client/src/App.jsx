import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Register from './pages/Register';
import Login from './pages/Login';
import store from './app/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import persistStore from 'redux-persist/es/persistStore';
import Dashboard from './pages/Dashboard';
import ThemeProvider from './components/ThemeProvider';
import PrivateRoute from './components/PrivateRoute';
import AdminPrivateRoute from './components/AdminPrivateRoute';
import CreateBlog from './pages/CreateBlog';
import UpdateBlog from './pages/UpdateBlog';
import ShowBlog from './pages/ShowBlog';
import ForgetPassword from './pages/ForgetPassword';
import ErrorBoundary from './components/ErrorBoundary';
import ScrollToTop from './components/ScrollToTop';
import Search from './components/Search';




const App = () => {

    return (
        <>
            <PersistGate persistor={persistStore(store)}>
                <Provider store={store}>
                    <BrowserRouter>
                        <ScrollToTop />
                        <ThemeProvider>
                            <Header />
                            <ErrorBoundary>
                            <Routes>
                                <Route path='/' element={<Home />} />
                                <Route path='/about' element={<About />} />
                                <Route path='/contact' element={<Contact />} />
                                <Route path='/register' element={<Register />} />
                                <Route path='/login' element={<Login />} />
                                <Route path='/blog/:blogSlug' element={<ShowBlog />} />
                                <Route path='/search' element={<Search />} />
                                <Route path='/blogs' element={<Search />} />
                                <Route path='/forget-password' element={<ForgetPassword />} />
                                <Route element={<PrivateRoute />}>
                                    <Route path='/dashboard' element={<Dashboard />} />
                                </Route>

                                <Route element={<AdminPrivateRoute />}>
                                    <Route path='/create-blog' element={<CreateBlog />} />
                                    <Route path='/update-blog/:blogId' element={<UpdateBlog />} />
                                </Route>

                            </Routes>
                            </ErrorBoundary>
                            <Footer />
                        </ThemeProvider>
                    </BrowserRouter>
                </Provider>
            </PersistGate>
        </>
    )
}
export default App