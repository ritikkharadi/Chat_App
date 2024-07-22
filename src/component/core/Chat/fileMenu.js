import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {toast} from "react-hot-toast"
import { setIsFileMenu, setUploadingLoader } from "../../../slices/other"; // Adjust path accordingly
import { sendAttachment } from '../../../services/operation/chatApi'; // Adjust path accordingly

const FileMenu = ({ anchorEl, chatId }) => {
  const { isFileMenu} = useSelector((state) => state.other);
  const dispatch = useDispatch();
  const imageRef = useRef(null);
  const audioRef = useRef(null);
  const videoRef = useRef(null);
  const fileRef = useRef(null);

  const closeFileMenu = () => dispatch(setIsFileMenu(false));

  const selectImage = () => imageRef.current?.click();
  const selectAudio = () => audioRef.current?.click();
  const selectVideo = () => videoRef.current?.click();
  const selectFile = () => fileRef.current?.click();

  const fileChangeHandler = async (e, key) => {
    const files = Array.from(e.target.files);

    if (files.length <= 0) return;

    if (files.length > 5) return toast.error(`You can only send 5 ${key} at a time`);

    dispatch(setUploadingLoader(true));

    const toastId = toast.loading(`Sending ${key}...`);
    closeFileMenu();

    try {
      const myForm = new FormData();
      myForm.append("ChatId", chatId);
      files.forEach((file) => myForm.append("files", file));

      const res = await sendAttachment(myForm);

      if (res.success) toast.success(`${key} sent successfully`, { id: toastId });
      else toast.error(`Failed to send ${key}`, { id: toastId });

      // Fetching Here
    } catch (error) {
      toast.error(`Error: ${error.message}`, { id: toastId });
    } finally {
      dispatch(setUploadingLoader(false));
    }
  };

  return (
    <div style={{ position: 'absolute', top: anchorEl?.top, left: anchorEl?.left, backgroundColor: 'white', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', zIndex: 1000 }}>
      <div style={{ width: '10rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div onClick={selectImage} style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span role="img" aria-label="image" style={{ fontSize: '1.5rem' }}>🖼️</span>
            <span style={{ marginLeft: '0.5rem' }}>Image</span>
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg, image/gif"
              style={{ display: 'none' }}
              onChange={(e) => fileChangeHandler(e, 'Images')}
              ref={imageRef}
            />
          </div>

          <div onClick={selectAudio} style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span role="img" aria-label="audio" style={{ fontSize: '1.5rem' }}>🎵</span>
            <span style={{ marginLeft: '0.5rem' }}>Audio</span>
            <input
              type="file"
              multiple
              accept="audio/mpeg, audio/wav"
              style={{ display: 'none' }}
              onChange={(e) => fileChangeHandler(e, 'Audios')}
              ref={audioRef}
            />
          </div>

          <div onClick={selectVideo} style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span role="img" aria-label="video" style={{ fontSize: '1.5rem' }}>🎥</span>
            <span style={{ marginLeft: '0.5rem' }}>Video</span>
            <input
              type="file"
              multiple
              accept="video/mp4, video/webm, video/ogg"
              style={{ display: 'none' }}
              onChange={(e) => fileChangeHandler(e, 'Videos')}
              ref={videoRef}
            />
          </div>

          <div onClick={selectFile} style={{ padding: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <span role="img" aria-label="file" style={{ fontSize: '1.5rem' }}>📁</span>
            <span style={{ marginLeft: '0.5rem' }}>File</span>
            <input
              type="file"
              multiple
              accept="*"
              style={{ display: 'none' }}
              onChange={(e) => fileChangeHandler(e, 'Files')}
              ref={fileRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileMenu;