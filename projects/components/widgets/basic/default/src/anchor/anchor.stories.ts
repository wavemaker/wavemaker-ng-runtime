import type { Meta, StoryObj } from '@storybook/angular';
import { AnchorComponent } from './anchor.component';

const meta: Meta<AnchorComponent> = {
  title: 'Form/Anchor',
  component: AnchorComponent,
  tags: ['autodocs'],
  argTypes: {}
};

export default meta;
type Story = StoryObj<AnchorComponent>;

export const Default: Story = {
  args: {
    caption:'sample',
    hyperlink:'https://www.google.co.in/',
    target:'_self',
    badgevalue:'1'

  },
};
export const AnchorWithIcon: Story = {
  args: {
    caption:'Sample',
   iconheight:'10',
   iconclass:'wi wi-plus',
   iconwidth:'10',
   iconposition:'left', 

  },
};