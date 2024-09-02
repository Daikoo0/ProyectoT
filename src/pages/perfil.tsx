import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const EditProfile: React.FC = () => {
  const { t } = useTranslation(['Perfil']);
  return (
    <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
      <h2 className="pl-6 text-2xl font-bold sm:text-xl">{t("edit")}</h2>
      {/* Formulario de edición */}
      <div className="grid max-w-2xl mx-auto mt-8">
        <div className="items-center mt-8 sm:mt-14 text-base-content">
          <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-base-content">Your first name</label>
              <input
                type="text"
                id="first_name"
                className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                placeholder="Your first name"
                value="Jane"
                required
              />
            </div>

            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-base-content">Your last name</label>
              <input
                type="text"
                id="last_name"
                className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                placeholder="Your last name"
                value="Ferguson"
                required
              />
            </div>
          </div>

          <div className="mb-2 sm:mb-6">
          <button
              type="submit"
              className="text-white bg-primary hover:bg-primary-focus focus:ring-4 focus:outline-none focus:ring-primary-focus font-medium rounded-lg text-sm w-full sm:w-full px-5 py-2.5 text-center"
            >
              Guardar
            </button>
            </div>

          <div className="mb-2 sm:mb-6">
            <button
              type="button"
              className="bg-red-500 text-white text-sm rounded-lg focus:ring-red-600 focus:border-red-600 block w-full p-2.5 hover:bg-red-600"
            >
              Delete account
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
};

const ChangePassword: React.FC = () => (
  <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
    <h2 className="pl-6 text-2xl font-bold sm:text-xl">Change Password</h2>
    {/* Cambiar contraseña */}
    <div className="grid max-w-2xl mx-auto mt-8">
      <div className="mb-2 sm:mb-6">
        <label className="block mb-2 text-sm font-medium text-base-content">Current Password</label>
        <input
          type="password"
          id="current_password"
          className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          placeholder="Current password"
          required
        />
      </div>
      <div className="mb-2 sm:mb-6">
        <label className="block mb-2 text-sm font-medium text-base-content">New Password</label>
        <input
          type="password"
          id="new_password"
          className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          placeholder="New password"
          required
        />
      </div>
      <div className="mb-2 sm:mb-6">
        <label className="block mb-2 text-sm font-medium text-base-content">Confirm New Password</label>
        <input
          type="password"
          id="confirm_new_password"
          className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          placeholder="Confirm new password"
          required
        />
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="text-white bg-primary hover:bg-primary-focus focus:ring-4 focus:outline-none focus:ring-primary-focus font-medium rounded-lg text-sm w-full sm:w-full px-5 py-2.5 text-center"
        >
          Change Password
        </button>
      </div>
    </div>
  </div>
);

const Profile: React.FC = () => {
  const [view, setView] = useState<string>('edit-profile');
  const { t } = useTranslation(['Perfil']);

  return (
    <div className="bg-base-100 w-full flex flex-col gap-5 px-3 md:px-16 lg:px-28 md:flex-row text-base-content">
      <aside className="hidden py-4 md:w-1/3 lg:w-1/4 md:block min-h-screen border-r border-base-300 my-8">
        <div className="sticky flex flex-col gap-2 p-4 text-sm top-12">
          <h2 className="pl-3 mb-4 text-2xl font-semibold">Account Settings</h2>
          <button
            onClick={() => setView('edit-profile')}
            className={`flex items-center px-3 py-2.5 font-bold bg-base-100 ${view === 'edit-profile' ? 'text-primary border' : 'hover:text-primary hover:border'} rounded-full`}
          >
            {t("edit")}
          </button>
          <button
            onClick={() => setView('change-password')}
            className={`flex items-center px-3 py-2.5 font-bold bg-base-100 ${view === 'change-password' ? 'text-primary border' : 'hover:text-primary hover:border'} rounded-full`}
          >
            Change Password
          </button>
        </div>
      </aside>

      <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
        <div className="p-2 md:p-4">
          {view === 'edit-profile' && <EditProfile />}
          {view === 'change-password' && <ChangePassword />}
          {/* Agregar más vistas según sea necesario */}
        </div>
      </main>
    </div>
  );
};

export default Profile;
