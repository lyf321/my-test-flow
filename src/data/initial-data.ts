export const initialData = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      position: { x: 100, y: 200 },
      data: {
        title: '开始',
      },
    },
    {
      id: 'enter_guide_1',
      type: 'enter-guide',
      position: { x:  350, y: 180 },
      data: {
        title: '入戏引导',
      },
    },
    {
      id: 'big_scene_1',
      type: 'big-scene',
      position: { x: 600, y: 100 },
      data: {
        title: '大场景 1',
        hasDetails: true,
        subScenes: [
          {
            id: 'sub_1',
            name: '小场景 1',
            description: '这是第一个小场景的描述',
          },
          {
            id: 'sub_2',
            name: '小场景 2',
            description: '这是第二个小场景的描述',
          },
        ],
      },
    },
    {
      id: 'big_scene_2',
      type: 'big-scene',
      position: { x: 850, y: 80 },
      data: {
        title: '大场景 2',
        hasDetails: true,
        subScenes: [],
      },
    },
    {
      id: 'exit_guide_1',
      type: 'exit-guide',
      position: { x: 600, y: 280 },
      data: {
        title: '出戏引导',
      },
    },
    {
      id: 'end_0',
      type: 'end',
      position: { x: 850, y: 260 },
      data: {
        title: '结束',
      },
    },
  ],
  edges: [
    {
      id: 'edge_1',
      source: 'start_0',
      target: 'enter_guide_1',
    },
    {
      id: 'edge_2',
      source: 'enter_guide_1',
      target: 'big_scene_1',
    },
    {
      id: 'edge_3',
      source: 'big_scene_1',
      target: 'big_scene_2',
    },
    {
      id: 'edge_4',
      source: 'big_scene_1',
      target: 'exit_guide_1',
    },
    {
      id: 'edge_5',
      source: 'exit_guide_1',
      target: 'end_0',
    },
  ],
}

