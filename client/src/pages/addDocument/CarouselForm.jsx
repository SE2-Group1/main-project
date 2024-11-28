import { useEffect, useRef, useState } from 'react';
import { Carousel } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { Button } from '../../components/Button.jsx';
import { useFeedbackContext } from '../../contexts/FeedbackContext.js';
import API from '../../services/API.js';
import { useDocumentManagerContext } from '../MapView/contexts/DocumentManagerContext.js';
import { CaroselPageOne } from './CaroselPageOne.jsx';
import { CaroselPageTwo } from './CaroselPageTwo.jsx';
import './style.css';

export const CarouselForm = ({ mode, closeHandlePanel }) => {
  const { showToast } = useFeedbackContext();
  const [scales, setScales] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [types, setTypes] = useState([]);
  const [languages, setLanguages] = useState([]);
  const { documentData, docInfo } = useDocumentManagerContext();

  const validateForm = () => {
    if (mode === 'modify') {
      if (docInfo.stakeholder.length === 0) {
        showToast(
          'At least one stakeholder must be added in modify mode.',
          'error',
        );
        return false;
      }
    } else {
      if (documentData.stakeholders.length === 0) {
        showToast(
          'At least one stakeholder must be added in modify mode.',
          'error',
        );
        return false;
      }
    }
    return true;
  };

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

  const updateDocument = async () => {
    return await API.updateDocument(docInfo.id_file, {
      title: docInfo.title,
      desc: docInfo.desc,
      scale: docInfo.scale,
      issuance_date: {
        year: docInfo.issuance_year,
        month: docInfo.issuance_month,
        day: docInfo.issuance_day,
      },
      type: docInfo.type,
      language: docInfo.language,
      pages: docInfo.pages,
      stakeholders: docInfo.stakeholder,
      id_area: docInfo.id_area,
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
          <CaroselPageOne
            elementData={{ scales: scales, stakeholders: stakeholders }}
            mode={mode}
          />
        </Carousel.Item>
        <Carousel.Item>
          <CaroselPageTwo
            elementData={{ languages: languages, types: types }}
            documentInfo
            mode={mode}
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
            if (currentForm && currentForm.reportValidity() && validateForm()) {
              if (pageController === 0) {
                setPageController(pageController => pageController + 1);
                onNextClick();
              } else if (pageController === 1) {
                try {
                  if (mode === 'add') {
                    await uploadDocument();
                    showToast('Document successfully uploaded', 'success');
                  } else if (mode === 'modify') {
                    await updateDocument();
                    showToast('Document successfully updated', 'success');
                  }
                  closeHandlePanel();
                } catch {
                  showToast('Error submitting document', 'error');
                }
              }
            }
          }}
        >
          {pageController === 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

CarouselForm.propTypes = {
  mode: PropTypes.string,
  closeHandlePanel: PropTypes.func,
};
