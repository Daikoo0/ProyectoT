import React, { useEffect, useState } from 'react';
import api from '../api/ApiClient';
import { useTranslation } from 'react-i18next';
import { UserEditing, UserPassword } from './types';
import { useAuth } from '../provider/authProvider';
import { useNavigate } from "react-router-dom";

interface EditProfileProps {
  user: UserEditing;
  setUser: React.Dispatch<React.SetStateAction<UserEditing>>;
}

interface ChangePasswordProps {
  pw: UserPassword;
  setPw: React.Dispatch<React.SetStateAction<UserPassword>>;
}

const EditProfile: React.FC<EditProfileProps> = ({ user, setUser }) => {
  const { t } = useTranslation(['Perfil']);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit() {
    if (!user.name || !user.lastName || !user.age || !user.gender || !user.nationality) {
      setMessage({ text: t("All fields are required"), type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/users/editprofile`, user);
      if (response.status === 200) {
        setMessage({ text: t("Profile updated successfully"), type: 'success' });
      } else {
        setMessage({ text: t("Failed to update profile"), type: 'error' });
      }
    } catch (error) {
      setMessage({ text: t("An error occurred while updating the profile"), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full p-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}
      <h2 className="pl-6 text-2xl font-bold sm:text-xl">{t("edit")}</h2>
      {/* Formulario de edición */}
      <div className="grid max-w-2xl mx-auto mt-8">
        <div className="items-center mt-8 sm:mt-14 text-base-content">
          <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-base-content">{t("firstName")}</label>
              <input
                type="text"
                id="first_name"
                className="input input-bordered w-full"
                placeholder={user.name}
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                required
              />
            </div>

            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-base-content">{t("lastName")}</label>
              <input
                type="text"
                id="last_name"
                className="input input-bordered w-full"
                placeholder={user.lastName}
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col items-center w-full mb-2 space-x-0 space-y-2 sm:flex-row sm:space-x-4 sm:space-y-0 sm:mb-6">
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-base-content">{t("age")}</label>
              <input
                type="number"
                id="age"
                className="input input-bordered w-full"
                value={user.age}
                onChange={(e) => setUser({ ...user, age: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-base-content">{t("gender")}</label>
              <select
                id="gender"
                className="select select-bordered w-full"
                onChange={(e) => setUser({ ...user, gender: e.target.value })}
                value={user.gender}
                required
              >
                <option value="">{t("selectGender")}</option>
                <option value="male">{t("male")}</option>
                <option value="female">{t("female")}</option>
                <option value="other">{t("other")}</option>
              </select>
            </div>
          </div>

          <div className="w-full mb-2 sm:mb-6">
            <label className="block mb-2 text-sm font-medium text-base-content">{t("nationality")}</label>
            <input
              type="text"
              id="nationality"
              className="input input-bordered w-full"
              placeholder={user.nationality}
              value={user.nationality}
              onChange={(e) => setUser({ ...user, nationality: e.target.value })}
              required
            />
          </div>

          <div className="mb-2 sm:mb-6">
            <button
              type="submit"
              className={"btn btn-primary w-full"}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <span className={`${isLoading ? 'loading loading-spinner' : ''}`}></span>
              {isLoading ? t("Saving...") : t("save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


const ChangePassword: React.FC<ChangePasswordProps> = ({ pw, setPw }) => {
  const { t } = useTranslation(["Perfil"])

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { setToken } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit() {
    if (!pw.password || !pw.newPassword || !pw.newPwConfirm) {
      setMessage({ text: t("All fields are required"), type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/users/chagePassword`, pw);
      if (response.status === 200) {
        setMessage({ text: t("Password updated successfully"), type: 'success' });
        setToken();
        navigate("/", { replace: true });
      } else {
        setMessage({ text: t("Failed to update password"), type: 'error' });
      }
    } catch (error) {
      setMessage({ text: t("An error occurred while updating the password"), type: 'error' });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="w-full px-6 pb-8 mt-8 sm:max-w-xl sm:rounded-lg">
      <h2 className="pl-6 text-2xl font-bold sm:text-xl">{t("changeP")}</h2>
      {/* Cambiar contraseña */}

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
          {message.text}
        </div>
      )}


      <div className="grid max-w-2xl mx-auto mt-8">
        <div className="mb-2 sm:mb-6">
          <label className="block mb-2 text-sm font-medium text-base-content">{t("currentP")}</label>
          <input
            type="password"
            id="current_password"
            className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            placeholder={"****************"}
            onChange={(e) => setPw({ ...pw, password: e.target.value })}
            value={pw.password}
            required
          />
        </div>
        <div className="mb-2 sm:mb-6">
          <label className="block mb-2 text-sm font-medium text-base-content">{t("newP")}</label>
          <input
            type="password"
            id="new_password"
            className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            placeholder="New password"
            onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            value={pw.newPassword}
            required
          />
        </div>
        <div className="mb-2 sm:mb-6">
          <label className="block mb-2 text-sm font-medium text-base-content">{t("confirmP")}</label>
          <input
            type="password"
            id="confirm_new_password"
            className="bg-base-200 border border-base-300 text-base-content text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
            placeholder="Confirm new password"
            onChange={(e) => setPw({ ...pw, newPwConfirm: e.target.value })}
            value={pw.newPwConfirm}
            required
          />
        </div>
        <div className="flex justify-end">
          {/* <button
            type="submit"
            className="text-white bg-primary hover:bg-primary-focus focus:ring-4 focus:outline-none focus:ring-primary-focus font-medium rounded-lg text-sm w-full sm:w-full px-5 py-2.5 text-center"
            onClick={handleSubmit}
          >
            {t("changeP")}
          </button> */}
          <button
              type="submit"
              className={"btn btn-primary w-full"}
              onClick={handleSubmit}
              disabled={isLoading}
            >
              <span className={`${isLoading ? 'loading loading-spinner' : ''}`}></span>
              {isLoading ? t("Saving...") : t("save")}
            </button>
        </div>
      </div>
    </div>
  )
};

const Profile: React.FC = () => {
  const [view, setView] = useState<string>('edit-profile');
  const { t } = useTranslation(['Perfil']);

  const [user, setUser] = useState<UserEditing>({
    name: "",
    lastName: "",
    age: 0,
    gender: "",
    nationality: ""
  });


  const [pw, setPw] = useState<UserPassword>({
    password: "",
    newPassword: "",
    newPwConfirm: ""
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await api.get("/users/me");
        console.log(response.data);
        setUser(response.data);

      } catch (error) {
        console.error("Error:", error);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="bg-base-100 w-full flex flex-col gap-5 px-3 md:px-16 lg:px-28 md:flex-row text-base-content">
      <aside className="hidden py-4 md:w-1/3 lg:w-1/4 md:block min-h-screen border-r border-base-300 my-8">
        <div className="sticky flex flex-col gap-2 p-4 text-sm top-12">
          <h2 className="pl-3 mb-4 text-2xl font-semibold">{t("settings")}</h2>
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
            {t("changeP")}
          </button>
        </div>
      </aside>

      <main className="w-full min-h-screen py-1 md:w-2/3 lg:w-3/4">
        <div className="p-2 md:p-4">
          {view === 'edit-profile' && <EditProfile user={user} setUser={setUser} />}
          {view === 'change-password' && <ChangePassword pw={pw} setPw={setPw} />}
          {/* Agregar más vistas según sea necesario */}
        </div>
      </main>
    </div>
  );
};

export default Profile;
