export const initialData = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      position: { x: 100, y: 250 },
      data: {
        title: '开始',
      },
    },
    {
      id: 'enter_guide_1',
      type: 'enter-guide',
      position: { x: 350, y: 200 },
      data: {
        title: '入戏引导',
        content: '此刻，你并不在地球。你正位于一艘正在遥航的虚拟船上，眼皮之外，是微末险名的星域。恒星的光在这处弧霾，宇宙安眠而流逝。',
      },
    },
    {
      id: 'big_scene_1',
      type: 'big-scene',
      position: { x: 850, y: 100 },
      data: {
        headerTitle: '开端1',
        title: '1.外一般桥内一夜',
        description: '般桥内的根烟引警声新街道到背景，一道不规则的光影在主视图边缘内现，随即镜头定一就不避光地的波段，系统提示当前慢，恒患光送出在当空照，导幅提示这是的光送出在当空照…',
        hasDetails: true,
        collapsed: false,
        subScenesCollapsed: false,
        subScenes: [
          {
            id: 'sub_1',
            name: '般桥镇傍向前',
            description: '般桥的灯光新街道定，控制台在你…一道不规则的光线在主视图边缘闪现，随即镜头稳定一就不避光地波段。',
          },
          {
            id: 'sub_2',
            name: '般重微微寒颤',
            description: '显示灯泡者老一盏亮起，又在…系统提示这是的光送出在当空照，导幅。',
          },
        ],
      },
    },
    {
      id: 'big_scene_2',
      type: 'big-scene',
      position: { x: 1400, y: 100 },
      data: {
        headerTitle: '开端2',
        title: '2.夜幕降临',
        description: '夜色渐渐笼罩整个城市，街灯依次亮起，形成一道道光的河流。远处传来汽笛声，预示着新的故事即将开始。',
        hasDetails: true,
        collapsed: false,
        subScenesCollapsed: false,
        subScenes: [],
      },
    },
    {
      id: 'exit_guide_1',
      type: 'exit-guide',
      position: { x: 1900, y: 200 },
      data: {
        title: '出戏引导',
        content: '船舱的灯光渐渐熄灭，星空的壮丽画面在你的视野中慢慢褪去。你感到身体逐渐回到现实，意识重新回归地球。',
      },
    },
    {
      id: 'end_0',
      type: 'end',
      position: { x: 2400, y: 250 },
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
      source: 'big_scene_2',
      target: 'exit_guide_1',
    },
    {
      id: 'edge_5',
      source: 'exit_guide_1',
      target: 'end_0',
    },
  ],
}

const testnode = {
  // 公共信息
  context: {
     userId: 1,
     tenantId: 1,
     scriptId: 1,
     versionId: 1
  },
  // 主线
  "mainLine": [
    {
      id: 0,
      data: {
        actName: null,
        sceneType: 1, // 1-引导场景；2-结束场景；0-普通场景
        sort: 0,
        title: "引导场景",
        summary: "您处在一片星光璀璨的宇宙空间",
        transitionType: "闪白",
      },
      componentInfo: {
        type: 1, // 组件类型
        position: {
          x: 1,
          y: 1
        }
      },
      parentId: -1, // 表示是第一个节点
      isMainLine: 1
    },
    {
      id: 1,
      actName: "开端",
      sceneType: 0, // 1-引导场景；2-结束场景；0-普通场景
      sort: 1,
      title: "内景-AI实验室-日",
      summary: "AI实验室内，气氛紧绷",
      transitionType: "闪白",
      componentInfo: {
        type: 1, // 组件类型
        position: {
          x: 5,
          y: 1
        }
      },
      parentId: 0,
      isMainLine: 1,
      itemList: [
        {
          id: 1,
          infoId: 1,
          sort: 1,
          title: "开发部",
          summary: "1111",
          componentInfo: {
            type: 2,
            position: {
          		x: 5,
          		y: 10
       		 }
          }
        }
      ]
    },
    {
      id: 2,
      actName: null,
      sceneType: 2, // 1-引导场景；2-结束场景；0-普通场景
      sort: 2,
      title: "",
      summary: "AI实验室内，气氛紧绷",
      transitionType: "闪白",
      componentInfo: {
        type: 1, // 组件类型
        position: {
          x: 10,
          y: 1
        }
      },
      parentId: 0,
      isMainLine: 1
    }
  ],
  // 非主线
  "otherLine": [
    {
      id: 0,
      actName: null,
      sceneType: 1, // 1-引导场景；2-结束场景；0-普通场景
      sort: 0,
      title: "引导场景",
      summary: "您处在一片星光璀璨的宇宙空间",
      transitionType: "闪白",
      componentInfo: {
        type: 1, // 组件类型
        position: {
          x: 1,
          y: 1
        }
      },
      parentId: -1, // 表示是第一个节点
      isMainLine: 0
    },
    {
      id: 1,
      actName: "开端",
      sceneType: 0, // 1-引导场景；2-结束场景；0-普通场景
      sort: 1,
      title: "内景-AI实验室-日",
      summary: "AI实验室内，气氛紧绷",
      transitionType: "闪白",
      componentInfo: {
        type: 1, // 组件类型
        position: {
          x: 5,
          y: 1
        }
      },
      parentId: 0,
      isMainLine: 0,
      itemList: [
        {
          id: 1,
          infoId: 1,
          sort: 1,
          title: "开发部",
          summary: "1111",
          componentInfo: {
            type: 2,
            position: {
          		x: 5,
          		y: 10
       		 }
          }
        }
      ]
    },
    {
      id: 2,
      actName: null,
      sceneType: 2, // 1-引导场景；2-结束场景；0-普通场景
      sort: 2,
      title: "结束场景",
      summary: "演员表",
      transitionType: null,
      componentInfo: {
        type: 1, // 组件类型
        position: {
          x: 10,
          y: 1
        }
      },
      parentId: 0,
      isMainLine: 0
    },
  ],
  // 2D画面
  "frameList": [
    {
      id: 1,
      summary: "1111",
      componentInfo: {
        type: 3,
        position: {
          x: 10,
          y: 1
        }
      },
      itemIds: [
        1,
        2,
        3
      ]
    }
  ]
}

