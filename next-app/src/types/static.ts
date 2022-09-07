export type User = {
  isLoggedIn: boolean;
  user_uuid: string;
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  position_id: number;
  section_id: number;
  concern_line: number[];
  created_at: string;
  updated_at: string;
  is_active: boolean;
  is_admin: boolean;
  is_viewer: boolean;
  is_recorder: boolean;
  is_checker: boolean;
  is_approver: boolean;
  qar_recorder: boolean;
  qar_editor: boolean;
  avatarUrl: string;
  access_token: string;
};

export type UserType = {
  [user_uuid: string]: UserDataType;
};

export type UserJoinRolePositionType = {
  [user_uuid: string]: UserJoinRolePositionDataType;
};

export type UserJoinRolePositionDataType = UserDataType &
  RoleDataType &
  PositionDataType;

export type UserDataType = {
  user_id: string;
  firstname: string;
  lastname: string;
  email: string;
  app_line_id: string;
  position_id: number;
  section_id: number;
  concern_section: number[];
  created_at: Date;
  updated_at: Date;
};

export type RoleDataType = {
  is_admin: boolean;
  is_viewer: boolean;
  is_recorder: boolean;
  is_checker: boolean;
  is_approved: boolean;
  qar_recorder: boolean;
  qar_editor: boolean;
};

export type PositionType = {
  [position_id: string]: PositionDataType;
};

export type PositionDataType = {
  position_level: number;
  position_name: string;
  position_full_name: string;
};

export type GroupType = {
  [group_id: string]: {
    group_name: string;
  };
};

export type GroupMemberType = {
  [group_id: string]: {
    data: GroupMemberDataType[];
  };
};

export type GroupMemberDataType = {
  id: number;
  user_uuid: string;
};

export type SectionType = {
  [section_id: string]: SectionDataType;
};

export type SectionDataType = {
  section_code: number;
  section_name: string;
  department_id: number;
};

export type DepartmentType = {
  [department_id: string]: {
    department_name: string;
  };
};

export type LineType = {
  [line_id: string]: LineDataType;
};

export type LineDataType = {
  line_name: string;
  work_center_code: string;
  section_id: number;
};

export type LinePartType = {
  [id: string]: {
    line_id: string;
    part_no: string;
  };
};

export type LineUserType = {
  [line_id: string]: {
    data: LineUserDataType[];
  };
};

export type LineUserDataType = {
  id: number;
  user_uuid: string;
};

export type MachineType = {
  [machine_no: string]: MachineDataType;
};

export type MachineDataType = {
  machine_no: string;
  machine_name: string;
  machine_type: string;
  machine_maker: string;
  machine_model: string;
};

export type ProcessType = {
  [process_id: string]: ProcessDataType;
};

export type ProcessDataType = {
  process_name: string;
  proces_type: ProcessTypeType;
  line_id: number;
};

export type ProcessMachineType = {
  [id: string]: {
    process_id: number;
    machine_no: string;
  };
};

export type ProcessTypeType = {
  [process_type_id: string]: {
    process_type_name: string;
  };
};

export type ProcessJoinTypeType = {
  [process_id: string]: ProcessJoinTypeDataType;
};

export type ProcessJoinTypeDataType = {
  process_name: string;
  line_id: number;
  process_type_id: number;
  process_type_name: string;
};

export type ProcessSymbolType = {
  [process_id: string]: {
    data: ProcessSymbolDataType[];
  };
};

export type ProcessSymbolDataType = {
  id: number;
  sc_symbol_id: number;
};

export type SCSymbolType = {
  [sc_symbol_id: string]: SCSymbolDataType;
};

export type SCSymbolDataType = {
  character: string;
  shape: string;
  remark: string;
};

export type ProductType = {
  [product_id: string]: ProductDataType;
};

export type ProductDataType = {
  full_name: string;
  short_name: string;
};

export type ModelType = {
  [model_id: string]: ModelDataType;
};

export type ModelDataType = {
  model_code: string;
  model_name: string;
  customer_id: number;
};

export type ModelPartType = {
  [id: string]: {
    part_no: string;
    model_id: number;
  };
};

export type ModelCustomerType = {
  [model_id: string]: {
    data: ModelCustomerDataType[];
  };
};

export type ModelCustomerDataType = {
  id: number;
  customer_id: number;
};

export type CustomerType = {
  [customer_id: string]: CustomerDataType;
};

export type CustomerDataType = {
  customer_name: string;
  customer_short_name: string;
};

export type CustomerPlantType = {
  [customer_id: string]: {
    data: CustomerPlantDataType[];
  };
};

export type CustomerPlantDataType = {
  customer_plant_id: number;
  customer_plant_name: string;
};

export type CustomerJoinPlantType = {
  [customer_id: string]: CustomerJoinPlantDataType;
};

export type CustomerJoinPlantDataType = {
  customer_name: string;
  customer_short_name: string | null;
  data: CustomerPlantDataType[];
};

export type PartType = {
  [part_no: string]: PartDataType;
};

export type PartDataType = {
  part_name: string;
  product_id: number;
  created_at: string;
  updated_at: string;
};

export type PartMachineType = {
  [id: string]: {
    part_no: string;
    machine_no: number;
  };
};

export type PartJoinProductType = {
  [part_no: string]: PartDataType & ProductDataType;
};

export type SubPartType = {
  id: number;
  main_part_no: string;
  sub_part_no: string;
};

// Request
export type RequestProcessType = {
  [request_process_id: string]: {
    request_process_name: string;
    request_process_short_name: string;
    request_process_tag_name: string;
  };
};

export type CategoryType =
  | "Man"
  | "Machine"
  | "Method"
  | "Material"
  | "Measurement"
  | "Environment";

export type ListItemDataType = {
  list_item_id: number;
  list_item_name: string;
  request_process_id: number;
};

export type ListItemType = {
  [category: string]: {
    data: ListItemDataType[];
  };
  // Man: ListItemDataType[];
  // Machine: ListItemDataType[];
  // Method: ListItemDataType[];
  // Material: ListItemDataType[];
  // Measurement: ListItemDataType[];
  // Environment: ListItemDataType[];
};

export type ItemDetailType = {
  [item_detail_id: string]: ItemDetailDataType;
};

export type ItemDetailDataType = {
  item_detail: string;
  list_item_id: number;
};

export type StateType = {
  [state_id: string]: StateDataType;
};

export type StateDataType = {
  state_name: string;
  state_description: string;
  state_type_id: number;
  request_process_id: number;
};

export type StateTypeType = {
  [state_type_id: string]: StateTypeDataType;
};

export type StateTypeDataType = {
  state_type_name: string;
};

export type StateJoinTypeType = {
  [state_id: string]: StateDataType & StateTypeDataType;
};

export type ActionType = {
  [action_id: string]: ActionDataType;
};

export type ActionDataType = {
  action_name: string;
  action_description: string;
  set_active: boolean;
  set_complete: boolean;
  action_type_id: number;
  request_process_id: number;
};

export type ActionTypeType = {
  [action_type_id: string]: ActionTypeDataType;
};

export type ActionTypeDataType = {
  action_type_name: string;
};

export type ActionJoinTypeType = {
  [action_id: string]: ActionDataType & ActionTypeDataType;
};

export type TransitionType = {
  [transition_id: string]: TransitionDataType;
};

export type TransitionDataType = {
  current_state_id: number;
  next_state_id: number;
  request_process_id: number;
  description: string;
};

export type TransitionActionType = {
  [transition_id: string]: TransitionActionDataType;
};

export type TransitionActionDataType = {
  id: number;
  action_id: number;
};

export type TransitionJoinTransitionActionType = {
  [transition_id: string]: TransitionDataType & TransitionActionDataType;
};

export type TransitionActivityType = {
  [id: string]: {
    transition_id: number;
    activity_id: number;
  };
};
