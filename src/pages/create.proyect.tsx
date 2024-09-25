import { useState } from 'react';
import { Marker, useMapEvents } from 'react-leaflet'
import Map from '../components/Web/Map';
import api from '../api/ApiClient';
import Navbar from '../components/Web/Narbar';
import { useTranslation } from 'react-i18next';

const ParticipantForm = () => {

  const [visible, setVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [message, setMessage] = useState('');
  const { t } = useTranslation("CProject");

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        setLat(e.latlng.lat)
        setLong(e.latlng.lng)

        map.setView(e.latlng, map.getZoom(), {
          animate: true,
        })
      },

    })

    if (lat !== null && long !== null) {
      map.setView([lat, long], map.getZoom(), {
        animate: true,
      })
    }
    if (lat === '' || long === '') {
      map.setView([-38.7027177, -72.5338521], map.getZoom(), {
        animate: true,
      })
    }

    return (lat && long) === null ? null : (
      <Marker
        position={[lat, long]}
        eventHandlers={{
          click: () => {
            setLat(null)
            setLong(null)
          },
        }}>
      </Marker>
    )
  }

  async function handleSubmit() {
    // Comprobar que todos los campos estén llenos
    if (!roomName || !location || !lat || !long || !desc) {
     setMessage("complete");
      return;
    }

    var Data = {
      roomName: roomName,
      location: location,
      lat: parseFloat(lat),
      long: parseFloat(long),
      desc: desc,
      visible: visible
    };

    try {
      const response = await api.post(`/rooms/create`, Data);

      console.log(response.status);

      if (response.status === 200) {
        setMessage("success");
        window.location.href = "/home";
      } else if (response.status === 500) {
        setMessage("error_create");
      } else {
        setMessage("unknown_error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("unknown_error");
    }
  }


  return (
    <div className='flex-1'>

      <Navbar logohidden={true} />

      <div className="flex w-full">
        <div className="grid h-full w-1/2 flex-grow card bg-base-300 rounded-box place-items-center p-4 ">

          <h1 className="text-5xl font-bold">{t("create")}</h1>

          <div className="flex p-6 w-full">
            <div className="form-control w-full max-w-xs mr-2">

              <label className="label-text">{t("name")}</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder={t("name")}
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>

            <div className="form-control w-full max-w-xs">
              <label className="label-text">{t("location")}</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="Chile, Temuco"
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div className="flex px-6 w-full">
            <div className="form-control w-full max-w-xs mr-2">
              <label className="label-text">{t("latitude")}</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder={t("latitude")}
                type="number"
                id="latitude"
                value={lat === null ? '' : lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>

            <div className="form-control w-full max-w-xs">
              <label className="label-text"> {t("longitude")}</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder={t("longitude")}
                type='number'
                id="longitude"
                value={long === null ? '' : long}
                onChange={(e) => setLong(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control w-full max-w-xs">
            <label className="label-text">{t("description")}:</label>
            <input
              className="input input-bordered w-full max-w-xs"
              placeholder={t("description")}
              type='text'
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="form-control w-full max-w-xs">

            {visible ? <>
              <label className="label-text "> {t("public")} </label>
            </> : <>
              <label className="label-text"> {t("private")}</label>
            </>}
            <input type="checkbox" className="toggle toggle-success" checked={visible} onChange={() => setVisible(!visible)} />
          </div>
          <div className="form-control mt-6">
            <button className="btn btn-neutral" onClick={handleSubmit}>{t("create_room")}</button>
          </div>

          <p>{t(message)}</p>

        </div>
        {/* Mapa */}
        <div className="grid w-1/2 card bg-base-300 rounded-box place-items-center p-4 ">

          <Map>

            <LocationMarker />

          </Map>

        </div>
      </div>

    </div>
  );
};

export default ParticipantForm;