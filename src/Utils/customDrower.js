import React from 'react';

const CustomDrawer = ({ isOpen, onClose, children }) => {
  return (
    <>
      {isOpen && (
        <div style={styles.overlay} onClick={onClose}>
          <div style={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={onClose}>X</button>
            {children}
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    //backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  drawer: {
    position: 'fixed',
    top: '56px', // Adjust this value based on your navbar height
    left: 0,
    width: '80%',
    maxWidth: '300px',
    height: 'calc(100% - 56px)', // Adjust this value based on your navbar height
    backgroundColor: '#fff',
    boxShadow: '2px 0 5px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    padding: '0', // Remove padding
    margin: '0', // Remove margin
    border: 'none', // Remove border
    boxSizing: 'border-box',
  },
  closeButton: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    background: 'transparent',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default CustomDrawer;