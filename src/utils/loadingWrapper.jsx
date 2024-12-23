import { Spin } from "antd";
import PropTypes from "prop-types";

const LoadingWrapper = ({ loading, children }) => {
  LoadingWrapper.propTypes = {
    loading: PropTypes.bool.isRequired, // 'loading' è un booleano ed è obbligatorio
    children: PropTypes.node.isRequired, // 'children' è un nodo React ed è obbligatorio
  };
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
