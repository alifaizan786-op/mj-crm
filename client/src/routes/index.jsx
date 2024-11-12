import { Suspense, useEffect, useState } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
} from 'react-router-dom';
import Auth from '../utils/auth';
import components from './components'; // Import your component mapping
import ErrorBoundary from './ErrorBoundary';
import routesJson from './routes.json'; // Import your JSON file

const AppRoutes = () => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    Auth.loggedIn()
      ? setRoutes(routesJson.authRoutes)
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
                  <Suspense fallback={<div>Loading...</div>}>
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
