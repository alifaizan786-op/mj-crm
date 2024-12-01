import { helix } from 'ldrs';
import { Suspense, useEffect, useState } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import UserFetch from '../fetch/UserFetch';
import UserRoutesFetch from '../fetch/UserRoutesFetch';
import Auth from '../utils/auth';
import components from './components'; // Import your component mapping
import ErrorBoundary from './ErrorBoundary';
import routesJson from './routes.json'; // Import your JSON file

const AppRoutes = () => {
  const [routes, setRoutes] = useState([]);
  helix.register();

  async function getAuthRoutes() {
    let userData = Auth.getProfile();
    const getUserData = await UserFetch.getUserById(
      userData.data._id
    );

    const userRoutes = await UserRoutesFetch.getUserRoutesByPaths({
      paths: getUserData.views,
    });

    setRoutes(userRoutes);
  }

  useEffect(() => {
    Auth.loggedIn()
      ? getAuthRoutes()
      : setRoutes(routesJson.publicRoutes);
  }, []);

  return (
    <Router>
      <Routes>
        {routes.map(({ path, element }) => {
          const Component = components[element];
          return (
            <Route
              key={path}
              path={path}
              element={
                <ErrorBoundary>
                  <Suspense
                    fallback={
                      // Default values shown
                      <l-helix
                        size='45'
                        speed='2.5'
                        color='black'></l-helix>
                    }>
                    <Component />
                  </Suspense>
                </ErrorBoundary>
              }
            />
          );
        })}
      </Routes>
    </Router>
  );
};

export default AppRoutes;
