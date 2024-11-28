import type { Meta, StoryObj } from '@storybook/angular';
import { fn } from '@storybook/test';

import { SearchComponent } from './search.component';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<SearchComponent> = {
  title: 'Input/Search',
  component: SearchComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<SearchComponent>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    minchars: 6,
    query: "test",
    searchkey: "test",
    dataset: ["test", "application"],
    width: "60%",
  },
};

export const Secondary: Story = {
  args: {
    minchars: 9,
    query: "secondary test",
    width: "70%",
  },
};
