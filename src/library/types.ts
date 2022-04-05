export type task = {
  status: string;
  event_name: string;
  event_id: number;
};
export type project = {
  status: string;
  project_name: string;
  project_id: number;
};
export type listItem = {
  id: number;
  title: string;
  status: string;
};
export type status = {
  status_id: string;
  status_name: string;
  color: string;
};
