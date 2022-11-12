import { RawNodeDatum } from 'react-d3-tree/lib/types/common';

export class Constants {
  static readonly TREE_ROOT_NAME = 'Memory';
  static readonly NODE_DIMENSION = 40;
  static readonly NODE_LINE_HEIGHT = 20;
  
  static readonly NODE_BORDER_WIDTH = "5";
  static readonly MEMORY_BOX_CORNER = "5";
  static readonly COLORS = ["#000000", "#FF9900", "#FF0000"];

  static readonly mockData: RawNodeDatum = {
    name: Constants.TREE_ROOT_NAME,
    attributes: {
      percentage: 100
    },
    children: [
      {
        name: 'ptr0',
        attributes: {
          isPointer: true,
          type: 'int*',
        },
        children: [
          {
            name: 'b0',
            attributes: {
              percentage: 100,
              linkPercentage: 100,
              onStack: false
            }
          }
        ]
      },
      {
        name: 'ptr1',
        attributes: {
          isPointer: true,
          type: 'int*',
        },
        children: [
          {
            name: 'b1',
            attributes: {
              percentage: 100,
              linkPercentage: 100,
              onStack: false
            }
          }
        ]
      }
    ]
  };
}