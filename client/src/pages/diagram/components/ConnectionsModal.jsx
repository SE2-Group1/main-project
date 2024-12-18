import { useCallback, useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';

import PropTypes from 'prop-types';

import { ConnectionsCard } from '../../../components/ConnectionsCard';
import { useFeedbackContext } from '../../../contexts/FeedbackContext';
import API from '../../../services/API';

export const ConnectionsModal = ({ isOpen, onHide, doc1, doc2 }) => {
  const { showToast } = useFeedbackContext();
  const [links, setLinks] = useState([]);

  const handleChangeLinks = useCallback(
    e => {
      const linkType = e.target.id;
      const isChecked = e.target.checked;
      const updatedLinks = links.map(conn =>
        conn.type === linkType ? { ...conn, checked: isChecked } : conn,
      );
      setLinks(updatedLinks);
    },
    [links],
  );

  const saveLinks = useCallback(async () => {
    const newLinks = links.map(conn => ({
      type: conn.type,
      isValid: conn.checked,
    }));
    try {
      await API.uploadDocumentLinks({
        doc1: doc1.id,
        doc2: doc2.id,
        links: newLinks,
      });
      showToast('Connections saved', 'success');
      onHide();
    } catch (err) {
      console.error(err);
      showToast('Failed to save connections. Try again.', 'error');
    } finally {
      setLinks([]);
    }
  }, [links, doc1, doc2, showToast, onHide]);

  useEffect(() => {
    // Fetch links
    const fetchLinks = async () => {
      const [linkTypesResponse, docResponse] = await Promise.all([
        API.getLinkTypes(),
        API.getDocument(doc1.id),
      ]);
      const docInfo = await docResponse;
      const linkTypes = await linkTypesResponse;
      const docLinks = docInfo.links
        .filter(link => link.docId === doc2.id)
        .map(conn => {
          return { type: conn.link_type, checked: true };
        });
      const allLinks = linkTypes
        .map(linkType => {
          const existingLink = docLinks.find(
            conn => conn.type === linkType.link_type,
          );
          return existingLink || { type: linkType.link_type, checked: false };
        })
        .sort((a, b) => a.type.localeCompare(b.type));
      setLinks(allLinks);
    };
    fetchLinks();
  }, [doc1, doc2]);

  return (
    <Modal show={isOpen} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title className="document-title">Edit connections</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ConnectionsCard
          doc1={doc1}
          doc2={doc2}
          links={links}
          handleChangeLinks={handleChangeLinks}
          saveLinks={saveLinks}
        />
      </Modal.Body>
    </Modal>
  );
};

ConnectionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  doc1: PropTypes.object,
  doc2: PropTypes.object,
};
