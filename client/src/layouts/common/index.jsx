import Header from '../../components/Header';

export default function CommonLayout({ children }) {
  document.title =
    'BB | ' +
    camelToNormal(
      window.location.href.split('/')[
        window.location.href.split('/').length - 1
      ]
    );

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
