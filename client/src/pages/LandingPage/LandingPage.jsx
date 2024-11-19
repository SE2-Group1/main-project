import { Button, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import Header from '../../components/Header.jsx';
// Import the Header component
import './LandingPage.css';

// Import the CSS file

export const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="home-container d-flex flex-column">
      <Header /> {/* Include the Header component */}
      <Row className="h-100 w-100">
        <Col
          className="home-column d-flex justify-content-center align-items-center h-100"
          id="column1"
          xs={12}
          md={4}
          onMouseEnter={() =>
            (document.getElementById('button1').style.display = 'block')
          }
          onMouseLeave={() =>
            (document.getElementById('button1').style.display = 'none')
          }
        >
          <Button
            id="button1"
            className="redirect-button"
            style={{ display: 'none' }}
            onClick={() => navigate('/mapView')}
          >
            Go to Map
          </Button>
          <svg
            className="column-line"
            width="47"
            height="5"
            viewBox="0 0 47 5"
            fill="none"
          >
            <rect width="47" height="5" fill="#A78B81" />
          </svg>
          <div className="column-text">Map</div>
        </Col>
        <Col
          className="home-column d-flex justify-content-center align-items-center h-100"
          id="column2"
          xs={12}
          md={4}
          onMouseEnter={() =>
            (document.getElementById('button2').style.display = 'block')
          }
          onMouseLeave={() =>
            (document.getElementById('button2').style.display = 'none')
          }
        >
          <Button
            id="button2"
            className="redirect-button"
            style={{ display: 'none' }}
          >
            Go to Diagram
          </Button>
          <svg
            className="column-line"
            width="47"
            height="5"
            viewBox="0 0 47 5"
            fill="none"
          >
            <rect width="47" height="5" fill="#A78B81" />
          </svg>
          <div className="column-text">Diagram</div>
        </Col>
        <Col
          className="home-column d-flex justify-content-center align-items-center h-100"
          id="column3"
          xs={12}
          md={4}
          onMouseEnter={() =>
            (document.getElementById('button3').style.display = 'block')
          }
          onMouseLeave={() =>
            (document.getElementById('button3').style.display = 'none')
          }
        >
          <Button
            id="button3"
            className="redirect-button"
            style={{ display: 'none' }}
          >
            Go to List
          </Button>
          <svg
            className="column-line"
            width="47"
            height="5"
            viewBox="0 0 47 5"
            fill="none"
          >
            <rect width="47" height="5" fill="#A78B81" />
          </svg>
          <div className="column-text">List</div>
        </Col>
      </Row>
    </div>
  );
};
