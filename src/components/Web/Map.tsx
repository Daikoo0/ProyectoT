import { MapContainer, TileLayer } from 'react-leaflet';
import './leaflet.css';

const Map = ({ children }) => {

    return (
        <MapContainer 
            style={{ width: '100%', height: '80vh' }} 
            center={[-38.7027177, -72.5338521]} 
            zoom={13} scrollWheelZoom={true}
        >

            <TileLayer
                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
            />

            {children}

        </MapContainer>
    );
};

export default Map;