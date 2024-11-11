import React from 'react';
import { Spin } from 'antd';

const LoadingWrapper = ({ loading, children }) => {
  return (
    <>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
          <Spin size="large" tip="Caricamento in corso..." />
        </div>
      ) : (
        children
      )}
    </>
  );
};

export default LoadingWrapper;
