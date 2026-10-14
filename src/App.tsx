import { BrowserRouter } from 'react-router';
import { PublicRouter } from '@/app/routes/PublicRouter';

function App() {
  return (
    <>
      <BrowserRouter>
        <PublicRouter />
      </BrowserRouter>
    </>
  );
}

export default App;
