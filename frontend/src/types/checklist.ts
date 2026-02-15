export interface ChecklistItem {
  _id?: string;
  label: string;
  agreed: boolean;
  conditionNote?: string;
}

export interface ExitChecklist {
  _id: string;
  agreementId: string;
  items: ChecklistItem[];
  completedAt?: string;
  createdAt: string;
}
