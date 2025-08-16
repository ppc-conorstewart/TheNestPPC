import { toast } from 'react-toastify';
import PalomaToast from '../components/PalomaToast';

export function showPalomaToast({ message, detail, type = 'success' }) {
  try {
    return toast(
      <PalomaToast type={type} message={message} detail={detail} />,
      {
        containerId: 'paloma',
        autoClose: 4100,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        style: { background: 'transparent', boxShadow: 'none' },
        progressStyle: { backgroundColor: '#6A7257', backgroundImage: 'none' }
      }
    );
  } catch (e) {
    // Fallback: avoid runtime if container is not yet mounted for any reason
    console.error('Paloma toast error', e);
  }
}
