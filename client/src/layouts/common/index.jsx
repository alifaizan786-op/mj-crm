import Header from '../../components/Header';

export default function CommonLayout({ children }) {
  return (
    <div
  >
      <Header />
      {children}
    </div>
  );
}
