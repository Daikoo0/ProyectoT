import { useDynamicSvgImport } from '../../utils/dynamicSvgImport';

interface IProps {
  iconName: string;
  folder: string;
  wrapperStyle?: string;
  svgProp?: React.SVGProps<SVGSVGElement>;
}

function SvgIcon(props: IProps) {
  const { iconName, folder,  wrapperStyle, svgProp } = props;
  const { loading, SvgIcon } = useDynamicSvgImport(iconName, folder);

  return (
    <>
      {loading ?
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width={50} height={50} className="stroke-primary fill-primary" >
          <circle strokeWidth="15" r="15" cx="40" cy="65">
            <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.4"></animate>
          </circle>
          <circle strokeWidth="15" r="15" cx="100" cy="65">
            <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="-.2"></animate>
          </circle>
          <circle stroke-width="15" r="15" cx="160" cy="65">
            <animate attributeName="cy" calcMode="spline" dur="2" values="65;135;65;" keySplines=".5 0 .5 1;.5 0 .5 1" repeatCount="indefinite" begin="0"></animate>
          </circle>
        </svg>
      :
      SvgIcon && (
        <div className={wrapperStyle}>
          <SvgIcon {...svgProp} />
        </div>
      )}
    </>
  );
}

export default SvgIcon;
