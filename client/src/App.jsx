import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import DocumentForm from './components/DocumentForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/submitDocument" element={<DocumentForm />} />
      </Routes>
    </Router>
  );
}

export default App;
