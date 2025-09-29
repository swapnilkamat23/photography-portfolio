import { makeStyles } from '@fluentui/react-components';
import Navbar from './components/navbar/Navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import About from './components/about/About';
import Contact from './components/contact/Contact';
import Projects from './components/projects/Projects';
// import './App.css'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '20px',
  }
});

function App() {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/about" element={<About />} />
          <Route path="/projects/*" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;