import React, { memo } from 'react';
import { useDynamicSvgImport } from '../../utils/dynamicSvgImport';

interface ItemProps {
    item: any;
    type: string;
    name: string;
}

const ItemSymbology: React.FC<ItemProps> = memo(({ item, type, name}) => {

    const { loading, SvgIcon } = useDynamicSvgImport(item, type);

    return (
        <div className="flex flex-row mt-4">
      <div className="card rounded-box grid place-items-center">
            {loading ?
                <svg
                    xmlns="http://www.w3.org/2000/svg" width={80} height={80} viewBox="0 0 200 200"><circle className="stroke-primary" fill="none" strokeOpacity="1" strokeWidth=".5" cx="100" cy="100" r="0"><animate attributeName="r" calcMode="spline" dur="1.3" values="1;80" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-width" calcMode="spline" dur="1.3" values="0;25" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate><animate attributeName="stroke-opacity" calcMode="spline" dur="1.3" values="1;0" keyTimes="0;1" keySplines="0 .2 .5 1" repeatCount="indefinite"></animate></circle></svg>
                :
                SvgIcon && (
                    <SvgIcon {...{ width: 80, height: 80 }} />
                )}
                {/* <p>{name}</p> */}
        </div>
        <div className="divider divider-horizontal"></div>
        <div className="card rounded-box grid place-items-center"><p style={{margin:20}}>{name}</p></div>
        </div>
    )

});

export default ItemSymbology;