import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import Map from '../components/Web/Map';

import Navbar from '../components/Web/Narbar';

const ParticipantForm = () => {

  const [visible, setVisible] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [lat, setLat] = useState(null);
  const [long, setLong] = useState(null);
  const [message, setMessage] = useState('')

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
    if(lat === '' || long === ''){
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

    var Data = {
      roomName: roomName,
      location: location,
      lat: parseFloat(lat),
      long: parseFloat(long),
      desc: desc,
      visible: visible

    };

    console.log(Data);

    const response = await fetch(`http://localhost:3001/rooms/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(Data),
    });

    const data = await response.json();
    console.log(response.status, data);

    if (response.status === 200) {
      setMessage("Sala " + roomName + " creada con éxito")
    }
    else
      if (response.status === 500) {

        setMessage("Error al crear la sala")
      }
  }

  return (
    <div className='flex-1'>
      
      <Navbar logohidden={true} />

      <div className="flex w-full">
        <div className="grid h-full w-1/2 flex-grow card bg-base-300 rounded-box place-items-center p-4 ">

          <h1 className="text-5xl font-bold">Crea un nuevo proyecto</h1>

          <div className="flex p-6 w-full">
            <div className="form-control w-full max-w-xs mr-2">

              <label className="label-text">Nombre de la sala:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="Nombre Sala"
                type="text"
                id="roomName"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
              />
            </div>

            <div className="form-control w-full max-w-xs">
              <label className="label-text">Localización:</label>
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
              <label className="label-text">Latitude:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="Ingrese Latitud"
                type="number"
                id="latitude"
                value={lat === null ? '' : lat}
                onChange={(e) => setLat(e.target.value)}
              />
            </div>

            <div className="form-control w-full max-w-xs">
              <label className="label-text"> longitude:</label>
              <input
                className="input input-bordered w-full max-w-xs"
                placeholder="Ingrese Longitud"
                type='number'
                id="longitude"
                value={long === null ? '' : long}
                onChange={(e) => setLong(e.target.value)}
              />
            </div>
          </div>

          <div className="form-control w-full max-w-xs">
            <label className="label-text"> Descripción:</label>
            <input
              className="input input-bordered w-full max-w-xs"
              placeholder="Ingrese Descripcion "
              type='text'
              id="desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="form-control w-full max-w-xs">

            {visible ? <>
              <label className="label-text "> Público </label>
            </> : <>
              <label className="label-text"> Privado</label>
            </>}
            <input type="checkbox" className="toggle toggle-success" checked={visible} onChange={() => setVisible(!visible)} />
          </div>
          <div className="form-control mt-6">
            <button className="btn btn-neutral" onClick={handleSubmit}>Crear Sala</button>
          </div>

          <p>{message}</p>

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