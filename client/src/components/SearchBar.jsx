import PropTypes from 'prop-types';

export const SearchBar = ({ search, setSearch }) => {
  return (
    <input
      type="text"
      placeholder="    Search a title"
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="form-control search-bar"
      style={{ maxWidth: '308px', marginBottom: '10px' }}
    />
  );
};

SearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
};
