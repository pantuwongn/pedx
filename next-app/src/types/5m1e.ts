import {
  CustomerJoinPlantDataType,
  GroupMemberDataType,
  LineDataType,
  MachineDataType,
  ModelDataType,
  ProcessJoinTypeDataType,
  ProductDataType,
  SCSymbolDataType,
  StateDataType,
  StateTypeDataType,
  TransitionJoinTransitionActionType,
  UserJoinRolePositionDataType,
} from "./static";

// report
export type ReportDataType = {
  request_process_id: number;
  request_process_name: string;
  state_id: number;
  category: string;
  list: string;
  detail: string[];
  product_id: number;
  line_id: number;
  process_id: string;
  machine_no: string;
  part_no: string;
  attachment: FileType[];
  note: string;
};

export type FileType = {
  requestFileName: string;
  requestFileContent: string;
  requestFileType: string;
};

// dashboard
export type RequestDashboardType = {
  [request_id: string]: {
    is_locked: boolean;
    request_process_id: number;
    line_id: number;
    current_state_id: number;
    request_data_id: number;
    request_data_value: RequestDataValueType;
    req_created_at: string;
    req_updated_at: string;
    req_user_uuid: string;
    data_created_at: string;
    data_updated_at: string;
    request_no: string;
    actions: RequestActionDataType[];
    files: RequestFileDataType[];
    concerneds: RequestConcernedDataType[];
  };
};

export type RequestDataValueType = {
  category: string;
  list: string;
  detail: string[];
  product_id: string;
  process_id: string;
  machine_no: string;
  part_no: string;
  note: string;
};

export type RequestActionDataType = {
  request_action_id: number;
  action_created_at: string;
  action_updated_at: string;
  is_active: boolean;
  is_complete: boolean;
  note: string;
  action_id: number;
  transition_id: number;
};

export type RequestFileDataType = {
  request_file_id: number;
  request_file_name: string;
  request_file_content: string;
  MIME_type: string;
  file_user_uuid: string;
};

export type RequestConcernedDataType = {
  concerned_user_uuid: string;
  group_id: number;
};

export type TableDataType = {
  key: number;
  id: string;
  type: string;
  request_id: string;
  request_no: string;
  is_locked: boolean;
  createdAt: string;
  updatedAt: string;
  productName: ProductDataType;
  partNo: string;
  partName: string;
  modelId: number | undefined;
  modelData: ModelDataType | undefined;
  process: string | ProcessJoinTypeDataType;
  scSymbol: string | SCSymbolDataType[];
  mcNo: string;
  mcData: MachineDataType;
  deptName: string;
  sectionCode: number;
  line: LineDataType;
  requestDataId: number;
  requestDataCreated: string;
  requestDataUpdated: string;
  category: string;
  listItem: string;
  itemDetail: string[];
  requestFile: RequestFileDataType[];
  requestNote: string;
  requesterName: string;
  tl: UserJoinRolePositionDataType[];
  mgr: UserJoinRolePositionDataType[];
  fm: UserJoinRolePositionDataType[];
  supporter: SupporterDataType[];
  requestStatus: StateDataType & StateTypeDataType;
  requestConcern: RequestConcernedDataType[];
  customers: CustomerJoinPlantDataType[] | undefined;
  actions: RequestActionDataType[];
  actionButton: TransitionJoinTransitionActionType;
};

export type SupporterDataType = {
  concerned_user_uuid: string;
  group_id: number;
  group_name: string;
  group_members: GroupMemberDataType[];
};
