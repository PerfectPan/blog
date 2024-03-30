export const Footer = () => {
  return (
    <footer className="p-6 text-center">
      © {new Date().getFullYear()}, Built with
        {` `}
      <a className='text-blue-500' href="https://waku.gg">Waku</a>
    </footer>
  );
};
