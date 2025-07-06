import { Spinner } from "react-bootstrap";
import PropTypes from "prop-types";

const LoadingWrapper = ({ loading, children }) => {
  LoadingWrapper.propTypes = {
    loading: PropTypes.bool.isRequired, // 'loading' è un booleano ed è obbligatorio
    children: PropTypes.node, // 'children' è opzionale
  };
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center min-vh-100"
        style={{
          background: "var(--background-primary)",
        }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
