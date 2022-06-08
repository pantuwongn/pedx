export interface RequestApprovalType {
  key: number
  id: number
  createdAt: string
  updatedAt: string
  productName: string
  partNo: string
  partName: string
  processName: string
  scSymbol: string
  mcNo: string

  deptName: string
  sectionCode: string
  lineName: string

  category: string
  listItem: string
  itemDetail: string[]
  requestFile: FileType[]
  requestNote: string

  requesterName: string
  tlName: string
  mgrName: string
  fmName: string
  supporter: string[]
  
  requestStatus: string
  requestConcern: string[]

  modelName: string[]
  customerName: string[]
  
  actionButton: string[]
}

export interface FileType {
  requestFileName: string
  requestFileContent: string
  requestFileType: string
}