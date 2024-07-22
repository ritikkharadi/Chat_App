import React, { useState, useEffect } from 'react';

const withDynamicImport = (importFunc) => {
  return (props) => {
    const [Component, setComponent] = useState(null);

    useEffect(() => {
      let isMounted = true;
      importFunc().then((module) => {
        if (isMounted) {
          setComponent(module.default);
        }
      });

      return () => {
        isMounted = false;
      };
    }, []);

    return Component ? <Component {...props} /> : <div>...Loading</div>;
  };
};

export default withDynamicImport;