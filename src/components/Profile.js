import React, { useEffect, useState } from 'react';
import { auth, deleteUser } from '../firebase-config';
import { collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase-config';
import { useNavigate } from 'react-router-dom';

const Profile = ({ onClose, setDataEntryCount, setFlashMessage }) => {
  const user = auth.currentUser;
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userRef = doc(collection(db, 'users'), user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
      }
    };
    fetchUsername();
  }, [user]);

  const handleDeleteAccount = async () => {
    try {
      if (user) {
        // Delete user's loan tracker data from Firestore
        const expensesRef = collection(db, 'users', user.uid, 'expenses');
        const querySnapshot = await getDocs(expensesRef);
        const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Delete user data from Firestore
        const userRef = doc(collection(db, 'users'), user.uid);
        await deleteDoc(userRef);

        // Delete user account from Firebase Authentication
        await deleteUser(user);

        // Reset the count and navigate to the home page
        setDataEntryCount(0);
        navigate('/');

        setFlashMessage({ type: 'success', message: 'Account deleted successfully.' });
        setTimeout(() => setFlashMessage(null), 1500);
      }
    } catch (error) {
      console.error('Error deleting user account and data:', error);
      setFlashMessage({ type: 'error', message: 'Failed to delete account. Please try again.' });
      setTimeout(() => setFlashMessage(null), 1500);
    }
  };

  return (
    <>
      <div className="profile-modal square-in-center fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen bg-black bg-opacity-50">
          <div className="bg-white relative rounded-lg overflow-hidden shadow-xl transform transition-all max-w-md w-full">
            <button
              type="button"
              onClick={onClose}
              className="absolute right-0 border hover:border-indigo-500 hover:text-indigo-500 hover:bg-purple-200 bg-indigo-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <div className="form-body px-6 py-4">
              <div className="text-xl font-semibold text-indigo-900 my-4 flex items-center">
                Profile Information
                <div className="ml-2 text-indigo-500">
                  <span role="img" aria-label="Profile">
                    👤
                  </span>
                </div>
              </div>
              {user && (
                <div className="mb-4">
                  <p>
                    <strong>Username:</strong> {username || 'N/A'}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                </div>
              )}
              <button
                onClick={handleDeleteAccount}
                className="w-full bg-red-500 border border-transparent hover:bg-white hover:border-red-600 hover:text-red-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;