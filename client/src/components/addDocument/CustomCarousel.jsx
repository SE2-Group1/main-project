import { useEffect, useRef, useState } from 'react';
import { Carousel } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import API from '../../services/API.js';
import { AddDocumentPageOne } from './AddDocumentPageOne.jsx';
import { AddDocumentPageTwo } from './AddDocumentPageTwo.jsx';
import './style.css';

export const CustomCarousel = ({ setDocumentInfoToAdd, documentInfoToAdd }) => {
  const { showToast } = useFeedbackContext();
  const [scales, setScales] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [types, setTypes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const navigate = useNavigate();
  const uploadDocument = async () => {
    await API.uploadDocument({
      title: documentInfoToAdd.title,
      desc: documentInfoToAdd.description,
      scale: documentInfoToAdd.scale,
      issuance_date: {
        year: documentInfoToAdd.issuanceDate.year,
        month: documentInfoToAdd.issuanceDate.month,
        day: documentInfoToAdd.issuanceDate.day,
      },
      type: documentInfoToAdd.type,
      language: documentInfoToAdd.language,
      pages: documentInfoToAdd.pages,
      stakeholders: documentInfoToAdd.stakeholders,
      id_area: documentInfoToAdd.id_area,
      georeference: documentInfoToAdd.georeference,
    });
  };
  useEffect(() => {
    const fetchData = async () => {
      const [
        stakeholdersResponse,
        scalesResponse,
        typesResponse,
        languagesResponse,
      ] = await Promise.all([
        API.getStakeholders(),
        API.getScales(),
        API.getTypes(),
        API.getLanguages(),
      ]);
      setStakeholders(await stakeholdersResponse);
      setScales(await scalesResponse);
      setTypes(await typesResponse);
      setLanguages(await languagesResponse);
    };
    fetchData();
  }, []);

  const [pageController, setPageController] = useState(0);

  const ref = useRef(null);

  const onPrevClick = () => {
    ref.current.prev();
  };
  const onNextClick = () => {
    ref.current.next();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '80vh',
      }}
    >
      <Carousel
        variant="dark"
        ref={ref}
        controls={false}
        indicators={true}
        interval={null}
      >
        <Carousel.Item>
          <AddDocumentPageOne
            dropDownListElements={{
              stakeholders: stakeholders,
              scales: scales,
            }}
            setDocumentInfoToAdd={setDocumentInfoToAdd}
            documentInfoToAdd={documentInfoToAdd}
          />
        </Carousel.Item>
        <Carousel.Item>
          <AddDocumentPageTwo
            dropDownListElements={{ languages: languages, types: types }}
            setDocumentInfoToAdd={setDocumentInfoToAdd}
          />
        </Carousel.Item>
      </Carousel>

      <div className="d-flex justify-content-between mt-3">
        <button
          disabled={pageController === 0}
          onClick={() => {
            setPageController(pageController => pageController - 1);
            console.log(pageController);
            onPrevClick();
          }}
          className="btn btn-primary"
        >
          Prev
        </button>
        <button
          type="submit"
          onClick={async e => {
            // Aggiungi async qui
            e.preventDefault();

            const currentForm = document.querySelector(
              '.carousel-item.active form',
            );
            if (currentForm && currentForm.reportValidity()) {
              if (pageController === 0) {
                setPageController(pageController => pageController + 1);
                onNextClick();
              } else if (pageController === 1) {
                await uploadDocument(); // Usa await per aspettare che l'upload sia completato
                showToast('Upload Docuemnt Successfully', 'success');
                navigate('/mapView', {
                  state: {
                    isAddingDocument: false,
                    timestamp: Date.now(),
                    showAddDocumentSidePanel: false,
                  },
                });
              }
            }
          }}
          className="btn btn-primary"
        >
          {pageController === 0 ? 'Next' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

CustomCarousel.propTypes = {
  setDocumentInfoToAdd: PropTypes.func.isRequired,
  documentInfoToAdd: PropTypes.object.isRequired,
};
