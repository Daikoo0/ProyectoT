import React, { useState } from 'react';

const EditProfile: React.FC = () => (
  <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
    <h2 className="pl-6 text-2xl font-bold sm:text-xl">Editar perfil</h2>
    {/* Formulario de edición */}
    <div className="grid max-w-2xl mx-auto mt-8">
      <div className="flex flex-col items-center space-y-5 sm:flex-row sm:space-y-0">
        <img
          className="object-cover w-40 h-40 p-1 rounded-full ring-2 ring-primary"
          src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGZhY2V8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60"
          alt="Bordered avatar"
        />

        <div className="flex flex-col space-y-5 sm:ml-8">
          <button
            type="button"
            className="py-3.5 px-7 text-base font-medium text-base-content focus:outline-none bg-primary rounded-lg border border-primary hover:bg-primary-focus focus:z-10 focus:ring-4 focus:ring-primary-focus"
          >
            Change picture
          </button>
          <button
            type="button"
            className="py-3.5 px-7 text-base font-medium text-primary focus:outline-none bg-base-100 rounded-lg border border-primary hover:bg-base-200 hover:text-primary-focus focus:z-10 focus:ring-4 focus:ring-primary-focus"
          >
            Delete picture
          </button>
        </div>
      </div>

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
          <label className="block mb-2 text-sm font-medium text-base-content">Your email</label>
          <input
            type="email"
            id="email"
            className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            placeholder="your.email@mail.com"
            required
          />
        </div>

        <div className="mb-2 sm:mb-6">
          <label className="block mb-2 text-sm font-medium text-base-content">Profession</label>
          <input
            type="text"
            id="profession"
            className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            placeholder="your profession"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium text-base-content">Bio</label>
          <textarea
            id="message"
            className="block p-2.5 w-full text-sm text-base-content bg-base-200 rounded-lg border border-base-300 focus:ring-primary focus:border-primary"
            placeholder="Write your bio here..."
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-white bg-primary hover:bg-primary-focus focus:ring-4 focus:outline-none focus:ring-primary-focus font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  </div>
);

const PublicProfile: React.FC = () => (
  <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
    <h2 className="pl-6 text-2xl font-bold sm:text-xl">Perfil público</h2>
    {/* Mostrar datos del perfil público */}
    <div className="grid max-w-2xl mx-auto mt-8">
      <p><strong>Nombre:</strong> Jane Ferguson</p>
      <p><strong>Email:</strong> your.email@mail.com</p>
      <p><strong>Profesión:</strong> Tu profesión</p>
      <p><strong>Bio:</strong> Escribe tu bio aquí...</p>
      {/* Otros datos públicos */}
    </div>
  </div>
);

const Profile: React.FC = () => {
  const [view, setView] = useState<string>('edit-profile');

  return (
    <div className="bg-base-100 w-full flex flex-col gap-5 px-3 md:px-16 lg:px-28 md:flex-row text-base-content">
      <aside className="hidden py-4 md:w-1/3 lg:w-1/4 md:block min-h-screen border-r border-base-300 my-8">
        <div className="sticky flex flex-col gap-2 p-4 text-sm top-12">
          <h2 className="pl-3 mb-4 text-2xl font-semibold">Settings</h2>
          <button
            onClick={() => setView('edit-profile')}
            className={`flex items-center px-3 py-2.5 font-bold bg-base-100 ${view === 'edit-profile' ? 'text-primary border' : 'hover:text-primary hover:border'} rounded-full`}
          >
            Editar perfil
          </button>
          <button
            onClick={() => setView('public-profile')}
            className={`flex items-center px-3 py-2.5 font-semibold ${view === 'public-profile' ? 'text-primary border' : 'hover:text-primary hover:border'} rounded-full`}
          >
            Perfil público
          </button>
          <button
            onClick={() => setView('abc')}
            className={`flex items-center px-3 py-2.5 font-semibold ${view === 'abc' ? 'text-primary border' : 'hover:text-primary hover:border'} rounded-full`}
          >
            abc
          </button>
          <button
            onClick={() => setView('defg')}
            className={`flex items-center px-3 py-2.5 font-semibold ${view === 'defg' ? 'text-primary border' : 'hover:text-primary hover:border'} rounded-full`}
          >
            defg
          </button>
        </div>
      </aside>

      <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
        <div className="p-2 md:p-4">
          {view === 'edit-profile' && <EditProfile />}
          {view === 'public-profile' && <PublicProfile />}
          {/* Agregar más vistas según sea necesario */}
        </div>
      </main>
    </div>
  );
};

export default Profile;
