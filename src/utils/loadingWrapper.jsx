import PropTypes from "prop-types";

const LoadingWrapper = ({ loading, children }) => {
  LoadingWrapper.propTypes = {
    loading: PropTypes.bool.isRequired,
    children: PropTypes.node,
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
