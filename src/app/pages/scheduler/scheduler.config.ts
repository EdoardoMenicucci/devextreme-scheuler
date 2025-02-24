export interface AppointmentFormField {
  dataField?: string;
  itemType?: string;
  colSpan?: number;
  label?: { text: string };
  editorType?: string;
  editorOptions?: any;
  cssClass?: string;
  horizontalAlignment?: string;
  buttonOptions?: any;
}

export interface ComponentContext {
  component: any;
  form: any;
  popup: any;
  friends: any[];
  isCompleted: any[];
  priority: PriorityLevel[];
  onAppointmentFormSharing: (username: string, appointmentData: any) => void;
}

export const PRIORITY_LEVELS = [
  { id: 1, text: 'Critical', color: '#DC2626' }, // Red
  { id: 2, text: 'High', color: '#F97316' }, // Orange
  { id: 3, text: 'Medium', color: '#4F46E5' }, // Accent (Regular Priority)
  { id: 4, text: 'Low', color: '#22C55E' }, // Green
];

export interface PriorityLevel {
  id: number;
  text: string;
  color: string;
}

// * Scheduler Form Customization Fields

export function getFormItems(
  context: ComponentContext
): AppointmentFormField[] {
  return [
    {
      dataField: 'text',
      colSpan: 2, // Occupa tutta la larghezza
      label: { text: 'Subject' },
      editorType: 'dxTextBox',
      editorOptions: {
        width: '100%',
      },
    },
    {
      dataField: 'startDate',
      label: { text: 'Start Date' },
      editorType: 'dxDateBox',
      editorOptions: {
        width: '100%',
        type: 'datetime',
      },
    },
    {
      dataField: 'endDate',
      label: { text: 'End Date' },
      editorType: 'dxDateBox',
      editorOptions: {
        width: '100%',
        type: 'datetime',
      },
    },
    {
      dataField: 'allDay',
      label: { text: 'All Day' },
      editorType: 'dxSwitch',
      cssClass: 'custom-switch-container',
      editorOptions: {
        width: '100%',
        switchedOnText: 'Yes',
        switchedOffText: 'No',
      },
    },
    {
      dataField: 'isCompleted',
      label: { text: 'Completion Status' },
      editorType: 'dxSelectBox',
      editorOptions: {
        items: context.isCompleted,
        displayExpr: 'text',
        valueExpr: 'id',
        width: '100%',
      },
    },
    {
      dataField: 'priority',
      label: { text: 'Priority Level' },
      colSpan: 2,
      editorType: 'dxSelectBox',
      editorOptions: {
        items: context.priority,
        displayExpr: 'text',
        valueExpr: 'text',
        width: '50%',
      },
    },
    {
      dataField: 'sharedWith',
      colSpan: 1, // Occupa tutta la larghezza
      label: { text: 'Share with friend' },
      editorType: 'dxSelectBox',
      editorOptions: {
        dataSource: context.friends,
        displayExpr: 'friendUsername',
        valueExpr: 'friendUsername',
        width: '100%',
        placeholder: 'Select a friend to share with',
      },
    },
    {
      itemType: 'button',
      colSpan: 1, // Occupa tutta la larghezza
      horizontalAlignment: 'left',
      cssClass: 'mt-4',
      buttonOptions: {
        text: 'Share',
        type: 'default',
        width: '100%', // Bottone largo quanto il form
        onClick: (e: any) => {
          const formInstance = context.form;
          const formData = formInstance.option('formData');

          if (formData.sharedWith) {
            context.onAppointmentFormSharing(formData.sharedWith, formData);
          }
        },
      },
    },
  ];
}

export function getToolbarItems(context: ComponentContext) {
  return [
    {
      widget: 'dxButton',
      location: 'after',
      toolbar: 'bottom',
      options: {
        text: 'Save',
        type: 'default',
        stylingMode: 'contained',
        onClick: () => {
          const formData = context.form.option('formData');

          if (formData) {
            if (formData.id) {
              context.component.onAppointmentUpdated({
                appointmentData: formData,
              });
            } else {
              context.component.onAppointmentAdded({
                appointmentData: formData,
              });
            }
            context.popup.hide();
          }
        },
      },
    },
    {
      widget: 'dxButton',
      location: 'after',
      toolbar: 'bottom',
      options: {
        text: 'Cancel',
        type: 'normal',
        stylingMode: 'contained',
        onClick: () => {
          context.popup.hide();
        },
      },
    },
    {
      widget: 'dxButton',
      location: 'before',
      toolbar: 'bottom',
      options: {
        text: 'Delete',
        type: 'danger',
        stylingMode: 'contained',
        onClick: (e: any) => {
          context.component.onAppointmentDeleted(e, {
            appointmentData: context.form.option('formData'),
          });
          context.popup.hide();
        },
      },
    },
  ];
}
