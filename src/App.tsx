import * as React from 'react';

// modals
import NiceModal from '@ebay/nice-modal-react';
import PostCardMore from './components/PostCardModal/PostCardMore';
import PostCardReport from './components/PostCardModal/PostCardReport';
import StoryModal from './components/Story/StoryModal';

import { useState, useEffect, lazy, Suspense } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';

// parts
import Navbar from './parts/Navbar/Navbar';
import MobileNavbar from './parts/MobileNavbar/MobileNavbar';
import RightSide from './parts/RightSide/RightSide';
import TabletNavBarNotAuth from './parts/TabletNavBarNotAuth/TabletNavBarNotAuth';

// util
// import History from "./util/History";
// import AuthRoute from "./util/AuthRoute";
//import ScrollToTop from "./util/ScrollToTop";

// libraries
import jwtDecode, { JwtPayload } from 'jwt-decode';
import axios from 'axios';

// context (global state)
import ThemeContextProvider from './context/ThemeContext';
import LanguageContextProvider from './context/LanguageContext';
import UserContext from './context/UserContext';
import PostsContext from './context/PostsContext';
import UserProfileContext from './context/UserProfileContext';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// api services
import UserService from './services/UserService';

// pages
import PageLoader from './pages/PageLoader/PageLoader';
import PriceContextProvider from './context/PriceContext';

// import Home from "./pages/Home/Home";
// import Login from "./pages/Login/Login";
const Home = lazy(() => import('./pages/Home/Home'));
const PostDetails = lazy(() => import('./pages/PostDetails/PostDetails'));
const Login = lazy(() => import('./pages/Login/Login'));
const Signup = lazy(() => import('./pages/Signup/Signup'));
const UserProfile = lazy(() => import('./pages/UserProfile/UserProfile'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Page404 = lazy(() => import('./pages/Page404/Page404'));
const Wallet = lazy(() => import('./pages/Wallet/Wallet'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Trends = lazy(() => import('./pages/Trends/Trends'));

/**
 * To solve CROS origin problem:
 *  use => https://cors-anywhere.herokuapp.com/{YOUR_API_URL}
 */

axios.defaults.baseURL =
  'https://asia-northeast3-coreators-tokenity.cloudfunctions.net/api';

function App() {
  // common modals
  NiceModal.register('postcard-more', PostCardMore);
  NiceModal.register('postcard-report', PostCardReport);
  NiceModal.register('story-modal', StoryModal);

  // start global state
  const [userData, setUserData] = useState({
    token: undefined,
    user: undefined,
    isAuth: false,
  });

  const [posts, setPostsData] = useState([]);
  const [userProfileData, setUserProfileData] = useState({
    friends: [],
    posts: [],
    user: {},
  });

  const history = useNavigate();

  useEffect(() => {
    const checkLoggedIn = async () => {
      let token = localStorage.getItem('auth-token');

      if (token === null) {
        localStorage.setItem('auth-token', '');
        token = '';
      }

      try {
        if (token) {
          const decodedToken: JwtPayload = jwtDecode(token);

          // check if token still available or expired
          if (
            decodedToken.exp != null &&
            decodedToken.exp * 1000 < Date.now()
          ) {
            // token expired
            localStorage.setItem('auth-token', '');
            token = '';
            setUserData({
              token: undefined,
              user: undefined,
              isAuth: false,
            });
            // console.log(
            //   decodedToken.exp * 1000,
            //   "<",
            //   Date.now(),
            //   "Token is expired!"
            // );
            history('/login');
          } else {
            let userData = window.sessionStorage.getItem('CacheUserData');
            // token not yet expire
            let cacheUserData = JSON.parse(userData);
            // check if user data was cached or not
            if (cacheUserData) {
              // user data is cached
              setUserData({
                token: cacheUserData.token,
                user: cacheUserData.user,
                isAuth: cacheUserData.isAuth,
              });
            } else {
              // user data is not cached, so execute an api request to fetch data.
              UserService.getAuthenticatedUser(token)
                .then((res) => {
                  setUserData({
                    token,
                    user: res.data,
                    isAuth: true,
                  });
                  // add data to the cache
                  window.sessionStorage.setItem(
                    'CacheUserData',
                    JSON.stringify({
                      token,
                      isAuth: true,
                      user: res.data,
                    })
                  );
                })
                .catch((error) => {
                  console.log('Unknown Token!', error);
                });
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    checkLoggedIn();
  }, [history]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'dark',
        },
      }),
    []
  );

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      <PostsContext.Provider value={{ posts, setPostsData }}>
        <UserProfileContext.Provider
          value={{ userProfileData, setUserProfileData }}
        >
          <ThemeProvider theme={theme}>
            <ThemeContextProvider>
              <LanguageContextProvider>
                <PriceContextProvider>
                  <NiceModal.Provider>
                    <div className="App">
                      <Navbar />
                      <MobileNavbar />
                      {!userData.isAuth && <TabletNavBarNotAuth />}
                      <Suspense fallback={<PageLoader />}>
                        {/* <ScrollToTop /> */}

                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route
                            path="/posts/:postId"
                            element={<PostDetails />}
                          />
                          <Route
                            path="/users/:userName"
                            element={<UserProfile />}
                          />
                          <Route
                            path="/notifications"
                            element={<Notifications />}
                          />
                          <Route path="/trends" element={<Trends />} />
                          <Route path="/wallet" element={<Wallet />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/signup" element={<Signup />} />
                          <Route path="404" element={<Page404 />} />
                          <Route path="*" element={<Page404 />} />
                        </Routes>
                      </Suspense>
                      <RightSide />
                    </div>
                  </NiceModal.Provider>
                </PriceContextProvider>
              </LanguageContextProvider>
            </ThemeContextProvider>
          </ThemeProvider>
        </UserProfileContext.Provider>
      </PostsContext.Provider>
    </UserContext.Provider>
  );
}

export default App;
