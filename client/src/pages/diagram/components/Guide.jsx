import PropTypes from 'prop-types';

export const Guide = ({ content }) => {
  return (
    <div
      style={{
        maxWidth: '10rem',
        border: 'solid',
        borderWidth: '2px',
        borderRadius: '10px',
        borderColor: 'var(--color-primary-500)',
        padding: '10px',
      }}
      className="mt-3"
    >
      <p style={{ color: 'var(--color-primary-500)' }}>{content}</p>
    </div>
  );
};

Guide.propTypes = {
  content: PropTypes.string.isRequired,
};
