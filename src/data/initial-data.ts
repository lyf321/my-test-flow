export const initialData = {
  nodes: [
    {
      id: 'start_0',
      type: 'start',
      position: { x: 180, y: 200 },
      data: {
        title: 'Start',
        outputs: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              default: 'Hello Flow.',
            },
          },
        },
      },
    },
    {
      id: 'condition_0',
      type: 'condition',
      position: { x: 500, y: 200 },
      data: {
        title: 'Condition',
        conditions: [
          {
            key: 'if_0',
            value: {
              left: {
                type: 'ref',
                content: ['start_0', 'query'],
              },
              operator: 'contains',
              right: {
                type: 'constant',
                content: 'Hello Flow.',
              },
            },
          },
        ],
      },
    },
    {
      id: 'end_0',
      type: 'end',
      position: { x: 800, y: 200 },
      data: {
        title: 'End',
        inputsValues: {
          success: {
            type: 'constant',
            content: true,
            schema: {
              type: 'boolean',
            },
          },
        },
      },
    },
  ],
  edges: [
    {
      id: 'edge_1',
      source: 'start_0',
      target: 'condition_0',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
    {
      id: 'edge_2',
      source: 'condition_0',
      target: 'end_0',
      sourceHandle: 'output',
      targetHandle: 'input',
    },
  ],
}

