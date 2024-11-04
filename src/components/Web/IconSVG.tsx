import React from 'react';
import { useDynamicSvgImport } from '../../utils/dynamicSvgImport';

// Componente de cargando SVG
const LoadingSvg = React.memo(() => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={50} height={50} className="stroke-primary fill-primary">
    <circle strokeWidth="15" r="15" cx="40" cy="65">
      <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4" />
    </circle>
    <circle strokeWidth="15" r="15" cx="100" cy="65">
      <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2" />
    </circle>
    <circle strokeWidth="15" r="15" cx="160" cy="65">
      <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0" />
    </circle>
  </svg>
));

interface IProps {
  iconName: string;
  folder: string;
  wrapperStyle?: string;
  svgProp?: React.SVGProps<SVGSVGElement>;
}

const SvgIcon = React.memo(function SvgIcon({ iconName, folder, wrapperStyle, svgProp }: IProps) {
  const { loading, SvgIcon: DynamicSvg } = useDynamicSvgImport(iconName, folder);

  return (
    <>
      {loading ? (
        <LoadingSvg />
      ) : (
        DynamicSvg && (
          <div className={wrapperStyle}>
            <DynamicSvg {...svgProp} />
          </div>
        )
      )}
    </>
  );
});

export default SvgIcon;
