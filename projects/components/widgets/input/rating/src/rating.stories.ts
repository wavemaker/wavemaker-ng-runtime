import type { Meta, StoryObj } from '@storybook/angular';
import { RatingComponent } from './rating.component';

const meta: Meta<RatingComponent> = {
  title: 'Form/Rating',
  component: RatingComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<RatingComponent>;


export const Default: Story = {
  args: {
    caption: 'Rating',
    activeiconclass: 'wi wi-star',
    inactiveiconclass: 'wi wi-star-border',
    readonly: false,
    showcaptions: true,
  }
};

export const IconColor: Story = {
  args: {
    caption: 'Rating',
    showcaptions: false,
    iconcolor: '#FFD700', 
  }
};

export const MaxVal: Story = {
  args: {
    caption: 'Rating',
    showcaptions: false,
    maxvalue: 10
  }
};

export const IconSize: Story = {
  args: {
    caption: 'Rating',
    showcaptions: false,
    iconsize: '32px'
  }
};

export const CustomDataset: Story = {
  args: {
    showcaptions: false,
    iconsize: '32px',
    dataset: [
      { 'rating': '1 star', 'email': 'john.doe@wm.com' },
      { 'rating': '2 star', 'email': 'jane.smith@wm.com' },
      { 'rating': '3 star', 'email': 'michael.johnson@wm.com' },
      { 'rating': '4 star', 'email': 'emily.davis@wn.com' },
      { 'rating': '5 star', 'email': 'john.davis@wm.com' }
    ],
    datafield: 'email',
    displayfield:'rating',
  }
};