import { useState, useEffect } from "react";
import { Marker } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';

import Map from '../../components/Web/Map';

const MapProject = ({Data}) => {


  return (

    <Map>
      <MarkerClusterGroup>
        {Data === null ? null : Data.map((proyecto, index) => (
          <Marker key={index} position={[proyecto.Lat, proyecto.Long]} />
        ))}
      </MarkerClusterGroup>;
    </Map>



  );
};

export default MapProject;