import React from 'react';
import Tree from 'react-d3-tree';
import { CustomNodeElementProps, RawNodeDatum, TreeLinkDatum } from 'react-d3-tree/lib/types/common';
import rawData from './mock/test1.json';
import { Constants } from './util/Constants';

const MemoryBlock = (name: string, attributes: Record<string, string | number | boolean>) => {
  return (
    <g>
      <rect
        width={Constants.NODE_DIMENSION}
        height={Constants.NODE_DIMENSION}
        rx={Constants.MEMORY_BOX_CORNER}
        x={-Constants.NODE_DIMENSION / 2}
        y={-Constants.NODE_DIMENSION / 2}
        style={{fill: 'none', stroke: Constants.COLORS[0], strokeWidth: Constants.NODE_BORDER_WIDTH}}
      />
      <text
        style={{position: 'absolute', strokeWidth: 1, fontSize: 15}}
        x={Constants.NODE_DIMENSION}
        y={0}>
          {name}
      </text>
      <text
        style={{position: 'absolute', strokeWidth: 1, fontSize: 15}}
        x={Constants.NODE_DIMENSION}
        y={Constants.NODE_LINE_HEIGHT}>
          {attributes.percentage ? `${attributes.percentage}%` : '100%'}
      </text>
      <text
        style={{position: 'absolute', strokeWidth: 1, fontSize: 15}}
        x={Constants.NODE_DIMENSION}
        y={Constants.NODE_LINE_HEIGHT * 2}>
          {attributes.onStack === undefined ? '' : (attributes.onStack ? 'stack' : 'heap')}
      </text>
      <text
        style={{position: 'absolute', strokeWidth: 1, fontSize: 15}}
        x={0}
        y={-Constants.NODE_DIMENSION / 2 - Constants.NODE_LINE_HEIGHT}>
          {attributes.linkPercentage ? `${attributes.linkPercentage}%` : ''}
      </text>
    </g>
  );
};

const MemoryPointer = (name: string, attributes: Record<string, string | number | boolean>) => {
  
  return (
    <g>
      <circle
        cx={0}
        cy={0}
        r={Constants.NODE_DIMENSION / 2}
        style={{fill: 'none', stroke: 'black', strokeWidth: Constants.NODE_BORDER_WIDTH}}
      />
      <text
        style={{position: 'absolute', strokeWidth: 1, fontSize: 15}}
        x={Constants.NODE_DIMENSION}
        y={0}>
          {name}
      </text>
      <text
        style={{position: 'absolute', strokeWidth: 1, fontSize: 15}}
        x={Constants.NODE_DIMENSION}
        y={Constants.NODE_LINE_HEIGHT}>
          {attributes.type}
      </text>
    </g>
  );
};

const MemoryTreeNode = (props: CustomNodeElementProps) => {
  const attributes = props.nodeDatum.attributes;
  if (!attributes) {
    return <g></g>;
  }
  console.log(props);

  if (attributes.isPointer) {
    return MemoryPointer(props.nodeDatum.name, attributes);
  } else {
    return MemoryBlock(props.nodeDatum.name, attributes);
  }
  
  
};

const MemoryTreeLink = (props: TreeLinkDatum) => {
  const { source: src, target: dst } = props;
  

  return `M${src.x},${src.y + Constants.NODE_DIMENSION / 2} L${dst.x},${dst.y - Constants.NODE_DIMENSION / 2}`;
}

const MemoryTree = () => {

  const data = Constants.mockData;
    
  return (
    <Tree
      data={data}
      renderCustomNodeElement={MemoryTreeNode}
      pathFunc={MemoryTreeLink}
      orientation='vertical'
    />
  );
};

export default MemoryTree;