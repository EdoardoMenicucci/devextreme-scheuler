/**
 * Represents a form field configuration for the appointment editor
 * @interface AppointmentFormField
 */
export interface AppointmentFormField {
  /** Field name in the data model */
  dataField?: string;
  /** Type of form item (e.g., 'simple', 'button', etc.) */
  itemType?: string;
  /** Number of columns the field spans in the form layout */
  colSpan?: number;
  /** Label configuration for the field */
  label?: { text: string };
  /** Type of editor to use for this field */
  editorType?: string;
  /** Configuration options for the editor component */
  editorOptions?: any;
  /** CSS class to apply to this field container */
  cssClass?: string;
  /** Horizontal alignment of the item */
  horizontalAlignment?: string;
  /** Configuration for button items */
  buttonOptions?: any;
}

/**
 * Context object passed to form configuration functions
 * @interface ComponentContext
 */
export interface ComponentContext {
  /** Reference to the scheduler component */
  component: any;
  /** Reference to the form instance */
  form: any;
  /** Reference to the popup containing the form */
  popup: any;
  /** List of users that appointments can be shared with */
  friends: any[];
  /** Available completion status options */
  isCompleted: any[];
  /** Available priority levels */
  priority: PriorityLevel[];
  /** Callback function to handle appointment sharing */
  onAppointmentFormSharing: (username: string, appointmentData: any) => void;
}

/**
 * Predefined priority levels for appointments
 * Each level has an ID, display text, and associated color
 * @constant {PriorityLevel[]}
 */
export const PRIORITY_LEVELS = [
  { id: 1, text: 'Critical', color: '#DC2626' }, // Red
  { id: 2, text: 'High', color: '#F97316' }, // Orange
  { id: 3, text: 'Medium', color: '#4F46E5' }, // Accent (Regular Priority)
  { id: 4, text: 'Low', color: '#22C55E' }, // Green
];

/**
 * Represents a priority level with its attributes
 * @interface PriorityLevel
 */
export interface PriorityLevel {
  /** Unique identifier for the priority level */
  id: number;
  /** Display text for the priority level */
  text: string;
  /** Color code for visual representation */
  color: string;
}

// * Scheduler Form Customization Fields

/**
 * Generates the form items configuration for the appointment editor
 * @param {ComponentContext} context - The component context containing references and data
 * @returns {AppointmentFormField[]} Array of form field configurations
 */
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

/**
 * Generates the toolbar items configuration for the appointment form popup
 * @param {ComponentContext} context - The component context containing references and data
 * @returns {Array} Array of toolbar item configurations
 */
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
