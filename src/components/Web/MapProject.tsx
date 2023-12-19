import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';

import Map from '../../components/Web/Map';

const MapProject = ({Data}) => {



  return (

    <Map>
      <MarkerClusterGroup>
        {Data === null ? null : Data.map((proyecto, index) => (
          <Marker key={index} position={[proyecto.Lat, proyecto.Long]}>
            <Popup>
              <h2 className="card-title">{proyecto.Name}</h2>
              <p><strong>Owner:</strong> {proyecto.Owner}</p>
              <p className=""><strong>Location:</strong> {proyecto.Location}</p>
              <p className=""><strong>Lat:</strong> {proyecto.Lat}</p>
              <p className=""><strong>Lng:</strong> {proyecto.Long}</p>
              <p className=""><strong>Creation Date:</strong> {proyecto.CreationDate}</p>
              <p className=""><strong>Description:</strong>{proyecto.Description}</p>
              <a href="#"  className="link link-primary text-left">Ver Contenido</a>
          
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>;
    </Map>



  );
};

export default MapProject;