import React from 'react';
import Header from '../../components/Header';



export default function CommonLayout({ children }) {
  React.useEffect(() => {
    if (!document.title || document.title === 'BB') {
      // Only set the title if it's not already set by the child
      document.title =
        'BB | ' +
        camelToNormal(
          window.location.href.split('/')[
            window.location.href.split('/').length - 1
          ]
        );
    }
  }, []); // Empty dependency array ensures this runs only once

  function camelToNormal(str) {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  return (
    <div>
      <Header />
      {children}
    </div>
  );
}
