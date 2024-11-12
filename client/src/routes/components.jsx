import { lazy } from 'react';

const components = new Proxy(
  {},
  {
    get: (_, name) => lazy(() => import(`../pages/${name}`)),
  }
);

export default components;
