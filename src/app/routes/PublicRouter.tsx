import { Route, Routes } from 'react-router';

export function PublicRouter() {
  return (
    <Routes>
      <Route path="/" element={<h1 className="text-2xl font-bold">Public Router</h1>} />
      <Route path="/about" element={<h1 className="text-2xl font-bold">About</h1>} />
      <Route path="/contact" element={<h1 className="text-2xl font-bold">Contact</h1>} />
    </Routes>
  );
}
