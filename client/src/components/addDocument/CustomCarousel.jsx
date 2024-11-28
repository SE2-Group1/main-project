import { useEffect, useRef, useState } from 'react';
import { Carousel } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import { useDocumentManagerContext } from '../../pages/MapView/contexts/DocumentManagerContext.js';
import API from '../../services/API.js';
import { Button } from '../Button.jsx';
import { AddDocumentPageOne } from './AddDocumentPageOne.jsx';
import { AddDocumentPageTwo } from './AddDocumentPageTwo.jsx';
import './style.css';

export const CustomCarousel = ({ handleDocumentSubmit }) => {
  const { documentData } = useDocumentManagerContext();
  const { showToast } = useFeedbackContext();
  const [scales, setScales] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [types, setTypes] = useState([]);
  const [languages, setLanguages] = useState([]);

  const uploadDocument = async () => {
    return await API.uploadDocument({
      title: documentData.title,
      desc: documentData.description,
      scale: documentData.scale,
      issuance_date: {
        year: documentData.issuanceDate.year,
        month: documentData.issuanceDate.month,
        day: documentData.issuanceDate.day,
      },
      type: documentData.type,
      language: documentData.language,
      pages: documentData.pages,
      stakeholders: documentData.stakeholders,
      id_area: documentData.id_area,
      georeference: documentData.georeference,
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
        className="p-4"
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
          />
        </Carousel.Item>
        <Carousel.Item>
          <AddDocumentPageTwo
            dropDownListElements={{ languages: languages, types: types }}
          />
        </Carousel.Item>
      </Carousel>
      <div className="d-flex justify-content-between mt-3 p-3">
        <Button
          variant="secondary"
          disabled={pageController === 0}
          onClick={() => {
            setPageController(pageController => pageController - 1);
            onPrevClick();
          }}
        >
          Prev
        </Button>
        <Button
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
                try {
                  const res = await uploadDocument(); // Usa await per aspettare che l'upload sia completato
                  handleDocumentSubmit(res.id_file);
                  showToast('Document successfully uploaded', 'success');
                } catch {
                  showToast('Error submitting document', 'error');
                }
              }
            }
          }}
        >
          {pageController === 0 ? 'Next' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

CustomCarousel.propTypes = {
  handleDocumentSubmit: PropTypes.func.isRequired,
};
