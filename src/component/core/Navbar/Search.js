import React from 'react';
import SearchUser from './searchUser';
const SearchModal = ({ isOpen, onClose }) => {
  return (
    <>
      {isOpen && (
        <div style={styles.overlay} onClick={onClose}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div>
              <SearchUser/>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
// import React, { useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

// const SearchModal = ({ isOpen, onClose }) => {
//   const {isUser} =useSelector((state)=>state.other);
//   const [searchUser]=useLazySearchUserQuery();

//   const dispatch=useDispatch();
 
//   // let isLoadingSendFriendRequest=false;

//   const [users,setUsers]=useSelector(sampleUsers);
  
//  useEffect(()=>{
//   const timeOutId=setTimeout(()=>{
//     console.log("sarch user",search.value);
//   },1000)
 



//  return ()=>{
//   clearTimeout(timeoutid);
//  },[search,value]);

//   return (
//     <>
//       {isOpen && (
//         <div style={styles.overlay} onClick={onClose}>
//           <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
//             <div style={styles.header}>
//               <h2>Search Users</h2>
//               <button style={styles.closeButton} onClick={onClose}>Close</button>
//             </div>
//             <div style={styles.content}>
//               <p>Hello, this is a placeholder for user search.</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    width: '520px',
    height: '580px',
    maxWidth: '90%',
    boxSizing: 'border-box',
  },
  header: {
    marginBottom: '10px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    lineHeight: '1.6',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#007BFF',
  },
};

export default SearchModal;