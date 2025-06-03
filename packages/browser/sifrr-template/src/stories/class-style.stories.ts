import { html, ref } from '@/index';
import type { Meta, StoryObj } from '@storybook/html';
import { expect, userEvent } from '@storybook/test';

const meta: Meta<{}> = {
  title: 'Sifrr/Template/Classes and style'
};

export default meta;
type Story = StoryObj<{}>;

export const Primary: Story = {
  render: () => {
    const ifref = ref(true);
    const padding = ref(16);
    const temp1 = html` <style>
        .fourth {
          font-size: 20px;
        }
      </style>
      <div
        class="abcd"
        :class-name=${() => ['first second', { third: true, fourth: ifref.value }]}
        style="position: static"
        :style=${() => ({
          padding: padding.value
        })}
      >
        classes
      </div>
      <button class="toggle-class" ::onclick=${() => (ifref.value = !ifref.value)}>
        Toggle class
      </button>
      <button class="increase" ::onclick=${() => padding.value++}>Increase padding</button>`(
      {},
      undefined
    );
    temp1.addRef(ifref);
    temp1.addRef(padding);
    const div = document.createElement('div');
    div.className = 'div';
    div.append(...temp1);

    return div;
  },
  play: async ({ canvasElement, canvas }) => {
    const div = canvasElement.querySelector('.div') as HTMLDivElement;
    const toggleClass = canvasElement.querySelector('.toggle-class') as HTMLButtonElement;
    const increase = canvasElement.querySelector('.increase') as HTMLButtonElement;

    expect(div.innerHTML).toEqual(`<style>
        .fourth {
          font-size: 20px;
        }
      </style><div class="abcd first second third fourth" style="position: static; padding: 16px;">
        classes
      </div><button class="toggle-class">
        Toggle class
      </button><button class="increase">Increase padding</button>`);

    await userEvent.click(toggleClass);

    expect(div.innerHTML).toEqual(`<style>
        .fourth {
          font-size: 20px;
        }
      </style><div class="abcd first second third" style="position: static; padding: 16px;">
        classes
      </div><button class="toggle-class">
        Toggle class
      </button><button class="increase">Increase padding</button>`);
    await userEvent.click(increase);

    expect(div.innerHTML).toEqual(`<style>
        .fourth {
          font-size: 20px;
        }
      </style><div class="abcd first second third" style="position: static; padding: 17px;">
        classes
      </div><button class="toggle-class">
        Toggle class
      </button><button class="increase">Increase padding</button>`);
    await userEvent.click(toggleClass);

    expect(div.innerHTML).toEqual(`<style>
        .fourth {
          font-size: 20px;
        }
      </style><div class="abcd first second third fourth" style="position: static; padding: 17px;">
        classes
      </div><button class="toggle-class">
        Toggle class
      </button><button class="increase">Increase padding</button>`);
  }
};
