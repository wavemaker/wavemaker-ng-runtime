import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Form/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
 
    argTypes: {
      type: { control: 'select', options: ['icon', 'image'] },
      animation:{control: 'select', options: ['bounce', 'fadeIn','fadeOut','flipInX','flipInY','pulse','shake','spin','swing','zoomIn','zoomOut'] }
    }
  
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {
  args: {
    iconclass:'wm-sl-r sl-loading',
    animation:'flash',
    showCaption:true

  },
};

export const IconSpinner: Story = {
  args: {
   type:'icon',
  iconclass:'wm-sl-r sl-loading',
  animation:'flash',
  showCaption:true
  },
};

export const ImageSpinner : Story = {
  args:{
    // image:'',
    imageheight:'100px',
    imagewidth:'100px',
  }
}