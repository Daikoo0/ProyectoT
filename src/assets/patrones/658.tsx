import * as React from "react";

const SvgIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns='http://www.w3.org/2000/svg'
        xmlSpace='preserve'
        width='54.125'
        height='54.125'
        viewBox='0 -54.125 54.125 54.125'
        {...props}
    >
        <rect width='100%' height='100%' y='-54.125'></rect>
        <path fill={props.fill} stroke={props.fill} d='M0-54.125h54.125V0H0z'></path>
    </svg>
);

export default React.memo(SvgIcon);
