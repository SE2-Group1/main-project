import PropTypes from 'prop-types';

export const SearchBar = ({ search, setSearch }) => {
  return (
    <input
      type="text"
      placeholder="    Search a title"
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="form-control search-bar"
    />
  );
};

SearchBar.propTypes = {
  search: PropTypes.string.isRequired,
  setSearch: PropTypes.func.isRequired,
};
