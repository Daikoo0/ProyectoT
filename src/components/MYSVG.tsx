import React from 'react';
import { Page, Text, View, Svg, Line, Path, G, Document, StyleSheet, Tspan } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  text: {
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
    // transform : 'rotate(90)',
    //  transform: 'rotate(-90 40 40)'
  },
  rotatedText: {
    fontWeight: 'bold',
    fontSize: 8,
    textAlign: 'center',
    transform: 'rotate(45deg)', // Cambia el ángulo según sea necesario
  },
});

var y90 = String(120*0.9)
var y50 = String(120*0.5)

const MySVG = ({wdth}) => (
  <Svg style={{ height: 120, backgroundColor: 'transparent' }} width={wdth*72/2.54} height="120">

    <Line y1="0%" y2="100%" x1="50%" x2="50%" strokeWidth={1} stroke="grey" />
    <Line y1="60%" y2="60%" x1="50%" x2="100%" strokeWidth={1} stroke="grey" />
    {/* <Path d="M137.5,105 L137.5,0" /> */}
    {/* <Text x=`{60%" y={y90} style={styles.rotatedText}>clay</Text> */}
    <Text x={0.55*wdth*72/2.54} y={y90}  style={{ fontSize:9, transform: `translate(${0.55*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.55*wdth*72/2.54}, -${y90})` }}>
      clay
    </Text>
    <Line y1="90%" y2="100%" x1="55%" x2="55%" strokeWidth={1} stroke="grey" />
    <Path d="M137.5,60 L137.5,0" />
    <Text x={`${0.55*wdth*72/2.54}`} y={y50} style={{ fontSize:9, transform: `translate(${0.55*wdth*72/2.54}, ${y50}) rotate(-90) translate(-${0.55*wdth*72/2.54}, -${y50})` }}>mud</Text>
    <Line y1="52%" y2="60%" x1="55%" x2="55%" strokeWidth={1} stroke="grey" />
    <Path d="M147.5,105 L147.5,0" />
    <Text x={`${0.59*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.59*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.59*wdth*72/2.54}, -${y90})` }}>silt</Text>
    <Line y1="90%" y2="100%" x1="59%" x2="59%" strokeWidth={1} stroke="grey" />
    <Path d="M157.5,105 L157.5,0" />
    <Text x={`${0.63*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.63*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.63*wdth*72/2.54}, -${y90})` }}>vf</Text>
    <Line y1="90%" y2="100%" x1="63%" x2="63%" strokeWidth={1} stroke="grey" />
    <Path d="M157.5,60 L157.5,0" />
    <Text x={`${0.63*wdth*72/2.54}`} y={y50} style={{ fontSize:9, transform: `translate(${0.63*wdth*72/2.54}, ${y50}) rotate(-90) translate(-${0.63*wdth*72/2.54}, -${y50})` }}>wacke</Text>
    <Line y1="52%" y2="60%" x1="63%" x2="63%" strokeWidth={1} stroke="grey" />
    <Path d="M167.5,105 L167.5,0" />
    <Text x={`${0.67*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.67*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.67*wdth*72/2.54}, -${y90})` }}>f</Text>
    <Line y1="90%" y2="100%" x1="67%" x2="67%" strokeWidth={1} stroke="grey" />
    <Path d="M177.5,105 L177.5,0" />
    <Text x={`${0.71*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.71*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.71*wdth*72/2.54}, -${y90})` }}>m</Text>
    <Line y1="90%" y2="100%" x1="71%" x2="71%" strokeWidth={1} stroke="grey" />
    <Path d="M177.5,60 L177.5,0" />
    <Text x={`${0.71*wdth*72/2.54}`} y={y50} style={{ fontSize:9, transform: `translate(${0.71*wdth*72/2.54}, ${y50}) rotate(-90) translate(-${0.71*wdth*72/2.54}, -${y50})` }}>pack</Text>
    <Line y1="52%" y2="60%" x1="71%" x2="71%" strokeWidth={1} stroke="grey" />
    <Path d="M187.5,105 L187.5,0" />
    <Text x={`${0.75*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.75*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.75*wdth*72/2.54}, -${y90})` }}>c</Text>
    <Line y1="90%" y2="100%" x1="75%" x2="75%" strokeWidth={1} stroke="grey" />
    <Path d="M197.5,105 L197.5,0" />
    <Text x={`${0.79*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.79*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.79*wdth*72/2.54}, -${y90})` }}>vc</Text>
    <Line y1="90%" y2="100%" x1="79%" x2="79%" strokeWidth={1} stroke="grey" />
    <Path d="M197.5,60 L197.5,0" />
    <Text x={`${0.79*wdth*72/2.54}`} y={y50} style={{ fontSize:9, transform: `translate(${0.79*wdth*72/2.54}, ${y50}) rotate(-90) translate(-${0.79*wdth*72/2.54}, -${y50})` }}>grain</Text>
    <Line y1="52%" y2="60%" x1="79%" x2="79%" strokeWidth={1} stroke="grey" />
    <Path d="M207.5,105 L207.5,0" />
    <Text x={`${0.83*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.83*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.83*wdth*72/2.54}, -${y90})` }}>gran</Text>
    <Line y1="90%" y2="100%" x1="83%" x2="83%" strokeWidth={1} stroke="grey" />
    <Path d="M207.5,60 L207.5,0" />
    <Text x={`${0.83*wdth*72/2.54}`} y={y50} style={{ fontSize:9, transform: `translate(${0.83*wdth*72/2.54}, ${y50}) rotate(-90) translate(-${0.83*wdth*72/2.54}, -${y50})` }}>redstone</Text>
    <Line y1="52%" y2="60%" x1="83%" x2="83%" strokeWidth={1} stroke="grey" />
    <Path d="M217.5,105 L217.5,0" />
    <Text x={`${0.87*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.87*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.87*wdth*72/2.54}, -${y90})` }}>pebb</Text>
    <Line y1="90%" y2="100%" x1="87%" x2="87%" strokeWidth={1} stroke="grey" />
    <Path d="M217.5,60 L217.5,0" />
    <Text x={`${0.87*wdth*72/2.54}`} y={y50} style={{ fontSize:9, transform: `translate(${0.87*wdth*72/2.54}, ${y50}) rotate(-90) translate(-${0.87*wdth*72/2.54}, -${y50})` }}>rud &amp; bound</Text>
    <Line y1="52%" y2="60%" x1="87%" x2="87%" strokeWidth={1} stroke="grey" />
    <Path d="M227.5,105 L227.5,0" />
    <Text x={`${0.91*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.91*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.91*wdth*72/2.54}, -${y90})` }}>cobb</Text>
    <Line y1="90%" y2="100%" x1="91%" x2="91%" strokeWidth={1} stroke="grey" />
    <Path d="M227.5,60 L227.5,0" />
    <Text x={`${0.91*wdth*72/2.54}`} y={y50} style={{ fontSize:9, transform: `translate(${0.91*wdth*72/2.54}, ${y50}) rotate(-90) translate(-${0.91*wdth*72/2.54}, -${y50})` }}>rudstone</Text>
    <Line y1="52%" y2="60%" x1="91%" x2="91%" strokeWidth={1} stroke="grey" />
    <Path d="M237.5,105 L237.5,0" />
    <Text x={`${0.95*wdth*72/2.54}`} y={y90} style={{ fontSize:9, transform: `translate(${0.95*wdth*72/2.54}, ${y90}) rotate(-90) translate(-${0.95*wdth*72/2.54}, -${y90})` }}>boul</Text>
    <Line y1="90%" y2="100%" x1="95%" x2="95%" strokeWidth={1} stroke="grey" />
  </Svg>
);


export default MySVG;