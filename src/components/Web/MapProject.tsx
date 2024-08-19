import { Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import Map from '../../components/Web/Map';
import { useNavigate } from 'react-router-dom';

const MapProject = ({Data}) => {

  const navigate = useNavigate();

  return (

    <Map>
      <MarkerClusterGroup>
        {Data === null ? null : Data.map((proyecto, index) => (
          <Marker key={index} position={[proyecto.ProjectInfo.Lat, proyecto.ProjectInfo.Long]}>
            <Popup>
            <div className="popup-content">
                <h2 className="card-title">{proyecto.ProjectInfo.Name}</h2>
                <p><strong>Owner:</strong> {proyecto.ProjectInfo.Owner}</p>
                <p><strong>Location:</strong> {proyecto.ProjectInfo.Location}</p>
                <p><strong>Lat:</strong> {proyecto.ProjectInfo.Lat}</p>
                <p><strong>Lng:</strong> {proyecto.ProjectInfo.Long}</p>
                <p><strong>Creation Date:</strong> {proyecto.ProjectInfo.CreationDate}</p>
                <p><strong>Description:</strong> {proyecto.ProjectInfo.Description}</p>
                <a className="link link-primary text-left" onClick={() => navigate(`/editor/${proyecto.ID}`)}>Ver Contenido</a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>;
    </Map>

  );
};

export default MapProject;