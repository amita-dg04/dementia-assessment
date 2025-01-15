import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
// import { Home, About} from './pages';
import { Home } from './pages';
import Assessment from './pages/Assessment';
import { useEffect } from 'react';

const App = () => {

  useEffect(() => {
    // Apply background color to the body when the component mounts
    document.body.style.backgroundColor = '#171717';
    // document.body.style.margin = '0'; // Optional: reset any default body margin
    // document.body.style.padding = '0'; // Optional: reset any default body padding
    document.body.style.height = '100%'; // Make sure it fills the screen
  }, []);

  return (
    <main style={{ backgroundColor: '#171717', height: '100vh', width: '100vw' }}>
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />}/>
                <Route path="/assessment/*" element={<Assessment />} />

            </Routes>

            {/* <Footer /> */}
        </Router>
    </main>
  )
}

export default App