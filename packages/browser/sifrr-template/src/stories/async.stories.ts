import { html } from '@/index';
import type { Meta, StoryObj } from '@storybook/html';
import { expect } from '@storybook/test';

const meta: Meta<unknown> = {
  title: 'Sifrr/Template/Async'
};

export default meta;
type Story = StoryObj<unknown>;

const fetchData = async (): Promise<{
  [key: string]: {
    name: string;
    firstname: string;
    lastname: string;
    id: number;
  };
}> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    '1': {
      name: 'Aaditya',
      firstname: 'Aaditya',
      lastname: 'Taparia',
      id: 1
    },
    '2': {
      name: 'Sifrr',
      firstname: 'Sifrr',
      lastname: 'At',
      id: 2
    }
  };
};

export const Primary: Story = {
  render: () => {
    const Component2 = async ({ id }: { id: string }) => {
      const data = await fetchData().then((d) => d[id]);
      return `${data?.firstname} ${data?.lastname}`;
    };

    const Component = html<{
      id: string;
      comp2Id: string;
    }>`
      Comp2 <br />
      ${({ comp2Id }: { id: string; comp2Id: string }) => Component2({ id: comp2Id })} <br />
      Comp1 <br />
      Name:
      ${({ id }: { id: string; comp2Id: string }) =>
        fetchData().then((data) => data[id]?.firstname + ' ' + data[id]?.lastname)}
      Id: ${({ id }: { id: string; comp2Id: string }) => fetchData().then((data) => data[id]?.id)}
    `;

    const element = document.createElement('div');
    element.append(...Component({ id: '2', comp2Id: '1' }));

    return element;
  },
  play: async ({ canvasElement }) => {
    await expect(canvasElement.innerHTML).toEqual(`<div>
      Comp2 <br><sifrr-fragment></sifrr-fragment><br>
      Comp1 <br><sifrr-fragment>
      Name:
      
      Id: </sifrr-fragment></div>`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await expect(canvasElement.innerHTML).toEqual(`<div>
      Comp2 <br><sifrr-fragment>Aaditya Taparia</sifrr-fragment><br>
      Comp1 <br><sifrr-fragment>
      Name:
      Sifrr At
      Id: 2</sifrr-fragment></div>`);
  }
};
